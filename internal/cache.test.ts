import {memCache} from "./cache";

describe("memCache", () => {
    it("should invoke the calc func and return the result", () => {
        const raw = jest.fn((s: string) => s + "test");
        const cached = memCache((s) => s + "id", raw);

        const testString = "test string";
        const result = cached(testString);

        expect(raw).toHaveBeenCalledTimes(1);
        expect(raw).toHaveBeenCalledWith(testString);
        expect(raw).toHaveReturnedWith(result);
    });

    it("should only calc once when ID is the same", () => {
        const raw = jest.fn((n: number) => n);
        const cached = memCache(() => "id", raw);

        const expectedResult = cached(6);
        for (let i = 0; i < 4; i++) {
            expect(cached(6)).toBe(expectedResult);
        }

        expect(raw).toHaveBeenCalledTimes(1);
        expect(raw).toHaveReturnedWith(expectedResult);
    });

    it("should support falsy cache values", () => {
        const raw = jest.fn((v: any) => v);
        const cached = memCache((v) => String(v), raw);

        const falsies = [false, 0, null, NaN, ""];
        for (const falsy of falsies) {
            for (let i = 0; i < 4; i++) {
                cached(falsy);
            }
        }

        expect(raw).toHaveBeenCalledTimes(falsies.length);
    });
});
