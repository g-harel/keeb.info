import fastGlob from "fast-glob";
import fs from "fs";
import json5 from "json5";
import path from "path";

import {ViaDefinition} from "../internal/via";

interface KeyboardMetadata {
    via?: ViaDefinition;
    viaPath?: string;
}

interface MetadataDB {
    // TODO these are not always numbers in QMK
    [vendorID: number]: {
        [productID: number]: KeyboardMetadata;
    };
}

const db: MetadataDB = {};
const getEntry = (vendorID: number, productID: number): KeyboardMetadata => {
    if (!db[vendorID]) db[vendorID] = {};
    if (!db[vendorID][productID]) db[vendorID][productID] = {};
    return db[vendorID][productID];
};

interface IngestErrors {
    viaInvalidID: {
        path: string;
    }[];
    viaConflictingDefinitions: {
        path1: string;
        path2: string;
    }[];
    qmkInfoSyntaxError: {
        path: string;
        error: string;
    }[];
    qmkEmptyInfo: {
        path: string;
    }[];
    qmkMissingConfig: {
        path: string;
    }[]
}

const errors: IngestErrors = {
    viaInvalidID: [],
    viaConflictingDefinitions: [],
    qmkInfoSyntaxError: [],
    qmkEmptyInfo: [],
    qmkMissingConfig: [],
};

const hexToInt = (hex: string): number | null => {
    let result = Number(hex);
    if (isNaN(result)) {
        result = Number("0x" + hex);
    }
    if (isNaN(result)) {
        return null;
    }
    return result;
};

const log = (messages: string | string[], data?: string | string[]) => {
    messages = [messages].flat(1);
    data = [data || []].flat(1);
    const message = `> ${messages.join(": ")}`;
    console.log([message, ...data].join("\n\t"));
};

// TODO convert to streams
// TODO use path helpers everywhere

const ingestVia = () => {
    fastGlob
        .sync("external/the-via/keyboards/v3/**/*.json")
        .forEach((definitionPath) => {
            const definition: ViaDefinition = JSON.parse(
                fs.readFileSync(definitionPath).toString("utf-8"),
            );
            const vendorID = hexToInt(definition.vendorId);
            const productID = hexToInt(definition.productId);
            if (vendorID === null || productID === null) {
                errors.viaInvalidID.push({path: definitionPath});
                return;
            }
            const entry = getEntry(vendorID, productID);
            if (entry.viaPath) {
                errors.viaConflictingDefinitions.push({
                    path1: entry.viaPath,
                    path2: definitionPath,
                });
                return;
            }
            entry.via = definition;
            entry.viaPath = definitionPath;
        });
};

// TODO change this to be folder based instead of indexing on info.json files.
const ingestQMK = () => {
    // TODO combine revisions of same board.
    // TODO do better for oddly laid out directories.
    fastGlob
        .sync("external/qmk/qmk_firmware/keyboards/**/info.json")
        .forEach((infoPath) => {
            const infoDir = path.dirname(infoPath);

            // Parent directories in ascending order (direct parent is first).
            const parentDirs: string[] = [path.dirname(infoDir)];
            while (!parentDirs[0].endsWith("qmk/qmk_firmware/keyboards")) {
                parentDirs.unshift(path.dirname(parentDirs[0]));
            }
            parentDirs.shift();
            parentDirs.reverse();

            // Read info file.
            const infoContentsRaw = fs.readFileSync(infoPath).toString("utf-8");
            let infoContents;
            try {
                infoContents = json5.parse(infoContentsRaw);
            } catch (e) {
                errors.qmkInfoSyntaxError.push({
                    path: infoPath,
                    error: String(e),
                });
                return;
            }

            // Ignore info files that don't define layouts.
            if (infoContents.layouts === undefined) {
                errors.qmkEmptyInfo.push({path: infoPath});
                return;
            }

            const configPath = path.join(infoDir, "config.h");
            if (!fs.existsSync(configPath)) {
                errors.qmkMissingConfig.push({path: configPath});
            }
        });

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

const time = (label: string, fn: () => any) => {
    console.time(label);
    fn();
    console.timeEnd(label);
};

//

time("the-via/keyboards", ingestVia);
time("qmk/qmk_firmware", ingestQMK);

// Log a summary of errors.
for (const [key, value] of Object.entries(errors)) {
    console.log(key, value.length);
}
console.log(errors.qmkMissingConfig)
