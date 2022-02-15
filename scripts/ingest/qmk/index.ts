import fs from "fs";
import path from "path";

import {Err} from "../../../internal/possible";
import {IngestContext} from "../context";
import {readFile, readJsonFile} from "../lib";
import {QMKConfig} from "./config";
import {QMKInfo} from "./info";
import {QMKRules, parse} from "./rules";

const ROOT = "external/qmk/qmk_firmware/keyboards/ai03/orbit";
const CONFIG = "config.h";
const INFO = "info.json";
const RULES = "rules.mk";

// Collect suspected keyboard roots.
const findRoots = (currentPath: string): string[] => {
    let roots: string[] = [];

    const nestedFiles: string[] = [];
    const nestedDirs: string[] = [];
    for (const nested of fs.readdirSync(currentPath)) {
        const nestedPath = path.join(currentPath, nested);
        if (fs.statSync(nestedPath).isDirectory()) {
            nestedDirs.push(nestedPath);
        } else {
            nestedFiles.push(nestedPath);
        }
    }

    // Decide whether current path is a root.
    let isRoot = false;
    for (const nestedFile of nestedFiles) {
        for (const rootFile of [CONFIG, INFO, RULES]) {
            if (path.basename(nestedFile) === rootFile) {
                isRoot = true;
                break;
            }
        }
        if (isRoot) break;
    }

    // Add current dir or keep looking depending on root status.
    if (isRoot) {
        roots.push(currentPath);
    } else {
        nestedDirs.forEach((nestedDir) => {
            roots = roots.concat(...findRoots(nestedDir));
        });
    }

    return roots;
};

// TODO combine revisions of same board.
// TODO do better for oddly laid out directories.
export const ingestQMK = (ctx: IngestContext) => {
    const roots = findRoots(ROOT);

    for (const root of roots) {
        let configContents: QMKConfig | null = null;
        const configPath = path.join(root, CONFIG);
        if (fs.existsSync(configPath)) {
            const config = readFile(configPath);
            if (Err.isErr(config)) {
                ctx.errors.qmkInvalidConfig.push({
                    path: configPath,
                    error: config.print(),
                });
                continue;
            }
            // TODO parse and validate config
        }

        let infoContents: QMKInfo | null = null;
        const infoPath = path.join(root, INFO);
        if (fs.existsSync(infoPath)) {
            const info = readJsonFile<QMKInfo>(infoPath);
            if (Err.isErr(info)) {
                ctx.errors.qmkInvalidInfo.push({
                    path: infoPath,
                    error: info.print(),
                });
                continue;
            }
            if (info.layouts !== undefined) {
                infoContents = info;
            }
        }

        let rulesContents: QMKRules | null = null;
        const rulesPath = path.join(root, RULES);
        console.log(rulesPath);
        if (fs.existsSync(rulesPath)) {
            const rawRules = readFile(rulesPath);
            if (Err.isErr(rawRules)) {
                ctx.errors.qmkInvalidRules.push({
                    path: rulesPath,
                    error: rawRules.print(),
                });
                continue;
            }

            const rules = parse(rawRules);
            if (Err.isErr(rules)) {
                console.log(rulesPath, rules.print());
                console.log("====");
                ctx.errors.qmkInvalidRules.push({
                    path: rulesPath,
                    error: rules.print(),
                });
                continue;
            }

            rulesContents = rules;
        }
    }

    // fastGlob
    //     .sync("external/qmk/qmk_firmware/keyboards/**/info.json")
    //     .forEach((infoPath) => {
    //         const infoDir = path.dirname(infoPath);

    //         // Parent directories in ascending order (direct parent is first).
    //         const parentDirs: string[] = [path.dirname(infoDir)];
    //         while (!parentDirs[0].endsWith("qmk/qmk_firmware/keyboards")) {
    //             parentDirs.unshift(path.dirname(parentDirs[0]));
    //         }
    //         parentDirs.shift();
    //         parentDirs.reverse();

    //         // Read info file.
    //         const infoContentsRaw = fs.readFileSync(infoPath).toString("utf-8");
    //         let infoContents;
    //         try {
    //             infoContents = json5.parse(infoContentsRaw);
    //         } catch (e) {
    //             errors.qmkInfoSyntaxError.push({
    //                 path: infoPath,
    //                 error: String(e),
    //             });
    //             return;
    //         }

    //         // Ignore info files that don't define layouts.
    //         if (infoContents.layouts === undefined) {
    //             errors.qmkEmptyInfo.push({path: infoPath});
    //             return;
    //         }

    //         const configPath = path.join(infoDir, "config.h");
    //         if (!fs.existsSync(configPath)) {
    //             errors.qmkMissingConfig.push({path: configPath});
    //         }
    //     });

    // Ignore info files that are not at the root of their directory.
    // let parentInfoDir = infoDir;
    // while (!parentInfoDir.endsWith("qmk/qmk_firmware/keyboards")) {
    //     parentInfoDir = path.dirname(parentInfoDir);
    //     const parentInfoPath = path.join(parentInfoDir, "info.json");
    //     if (fs.existsSync(parentInfoPath)) {
    //         const parentInfoContents = JSON.parse(
    //             fs.readFileSync(parentInfoPath).toString("utf-8"),
    //         );
    //         if (parentInfoContents.layout) {
    //             log("found parent info", parentInfoDir);
    //             return;
    //         }
    //     }
    // }

    // let boardFolderPath = path.dirname(infoPath);
    // let configPaths: string[] = [];
    // while (!boardFolderPath.endsWith("qmk/qmk_firmware/keyboards")) {
    //     configPaths = fastGlob.sync(boardFolderPath + "/**/config.h");
    //     if (configPaths.length > 0) break;
    //     boardFolderPath = path.dirname(boardFolderPath);
    // }
    // if (configPaths.length === 0) {
    //     log("could not find configs", infoPath);
    //     return;
    // }

    // const configFile = fs.readFileSync(path).toString("utf-8");
    // let configPath = path;
    // let vendorID = null;
    // let productID = null;
    // while (configPath.startsWith("external/qmk/qmk_firmware/keyboards")) {
    //     console.log(configPath);
    //     const vendorIDmatch = /#define\s+VENDOR_ID\s+(0x[0-9a-fA-F]+)/g.exec(configFile);
    //     const productIDmatch = /#define\s+PRODUCT_ID\s+(0x[0-9a-fA-F]+)/g.exec(configFile);
    //     if (vendorIDmatch === null || productIDmatch === null) {
    //         configPath = configPath.replace(/[^\/]+\/config\.h/g, "config.h");
    //         continue;
    //     }
    //     vendorID = hexToInt(vendorIDmatch[1]);
    //     productID = hexToInt(productIDmatch[1]);
    //     break;
    // }
    // if (vendorID === null || productID === null) {
    //     console.log(`Could not find VENDOR_ID or PRODUCT_IDs: ${path}`);
    //     return;
    // }
    // console.log(path);
};
