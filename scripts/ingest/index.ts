import path from "path";

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

    // Log a summary of errors.
    for (const [key, value] of Object.entries(ctx.errors)) {
        console.log("\t", key, value.length);
    }

    const err = writeFile(outFile, index);
    if (isErr(err)) {
        console.error(err.print());
        process.exit(1);
    }

    // TODO write keyboards by name instead of index.
    for (let i = 0; i < keyboards.length; i++) {
        const keyboardOutFile = path.join(outDir, `${i}.json`);
        const err = writeFile(keyboardOutFile, JSON.stringify(keyboards[i]));
        if (isErr(err)) {
            console.error(err.print());
            process.exit(1);
        }
    }

    console.log(
        `Wrote ${Math.round(index.length / 1000)}kB ` +
            `to ${outFile} and ${keyboards.length} keyboards.`,
    );
    process.exit(0);
})();
