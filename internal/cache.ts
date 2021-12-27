interface Calc<I, O> {
    (input: I): O;
}

export const memCache = <I, O>(
    ider: (input: I) => string,
    calc: Calc<I, O>,
): Calc<I, O> => {
    const cache: Record<string, O> = {};
    return (input: I): O => {
        const id = ider(input);
        if (cache[id] === undefined) {
            cache[id] = calc(input);
        }
        return cache[id];
    };
};
