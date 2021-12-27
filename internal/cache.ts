import {genID} from "./util";
import {calcKeycap} from "./key";

interface Calc<I, O> {
    (input: I): O;
}

interface CacheType<I, O> {
    id: (input: I) => string;
    calc: Calc<I, O>;
}

const globalCache: Record<string, any> = {};

const toAccessor = <I, O>(type: CacheType<I, O>): Calc<I, O> => {
    return (input: I): O => {
        const id = type.id(input);
        if (!globalCache[id]) {
            globalCache[id] = type.calc(input);
        }
        return globalCache[id];
    };
};

export const cache = {
    keycapShape: toAccessor({
        id: (input) => genID("keycap-shape", input),
        calc: calcKeycap,
    }),
};
