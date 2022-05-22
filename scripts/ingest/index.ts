import path from "path";
import sanitize from "sanitize-filename";

import {isErr} from "../../internal/possible";
import {createContext} from "./context";
import {exportKeyboards} from "./export";
import {writeFile} from "./lib";
import {ingestQMK} from "./qmk";
import {ingestVia} from "./via";

const outFile = process.argv[2];
const outDir = process.argv[3];
if (outFile === undefined || outDir === undefined) {
    console.error("Usage: ingest [outFile] [outDir]");
    process.exit(1);
}

const time = (label: string, fn: () => any) => {
    console.time(label);
    fn();
    console.timeEnd(label);
};

const ctx = createContext();

// TODO convert to streams
time("the-via/keyboards", () => ingestVia(ctx));
time("qmk/qmk_firmware", () => ingestQMK(ctx));

// Write data to files.
(async () => {
    const [index, keyboards] = await exportKeyboards(ctx);

    // Write index and keyboards to output.
    const output = writeFile(outFile, index);
    if (isErr(output)) {
        console.error(output.err.print());
        process.exit(1);
    }
    Object.entries(keyboards).forEach(([name, keyboard]) => {
        const keyboardOutFile = path.join(outDir, `${name}.json`);
        if (name !== sanitize(name)) {
            ctx.errors.nameInvalid.push({
                path: keyboardOutFile,
            });
            return;
        }
        const output = writeFile(keyboardOutFile, JSON.stringify(keyboard));
        if (isErr(output)) {
            console.error(output.err.print());
            process.exit(1);
        }
    });
    console.log(
        `Wrote ${Math.round(index.length / 1000)}kB ` +
            `to ${outFile} and ${Object.keys(keyboards).length} keyboards.`,
    );

    // Log a summary of errors.
    for (const [key, value] of Object.entries(ctx.errors)) {
        console.log("ERR", key, value.length);
    }
    // console.log(ctx.errors.nameInvalid);

    process.exit(0);
})();
