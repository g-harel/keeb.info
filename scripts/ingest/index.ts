import {createContext} from "./context";
import { writeFile } from "./lib";
import {flatten} from "./metadata";
import {ingestQMK} from "./qmk";
import {ingestVia} from "./via";

const outFile = process.argv[2];
if (outFile === undefined) {
    console.error("Usage: ingest [outFile]");
    process.exit(1);
}
console.log(outFile)

const time = (label: string, fn: () => any) => {
    console.time(label);
    fn();
    console.timeEnd(label);
};

const ctx = createContext();

// TODO convert to streams
time("the-via/keyboards", () => ingestVia(ctx));
time("qmk/qmk_firmware", () => ingestQMK(ctx));

const metadata = flatten(ctx);
writeFile(outFile, JSON.stringify(metadata));

// Log a summary of errors.
for (const [key, value] of Object.entries(ctx.errors)) {
    console.log(key, value.length);
}
// console.log(ctx.errors);
