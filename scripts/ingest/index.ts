import {createContext} from "./context";
import {flatten} from "./metadata";
import {ingestQMK} from "./qmk";
import {ingestVia} from "./via";

// TODO convert to streams

const time = (label: string, fn: () => any) => {
    console.time(label);
    fn();
    console.timeEnd(label);
};

const ctx = createContext();

time("the-via/keyboards", () => ingestVia(ctx));
time("qmk/qmk_firmware", () => ingestQMK(ctx));

const metadata = flatten(ctx);

// Log a summary of errors.
for (const [key, value] of Object.entries(ctx.errors)) {
    console.log(key, value.length);
}
// console.log(ctx.errors);
