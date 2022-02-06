import { Err } from "./possible";


describe("Err", () => {
    // TODO make table of values.

    it("Should detect errors.", () => {
        const err = Err.err("test");
        expect(Err.isErr(err)).toBeTruthy();
    });

    it("Should detect non-errors.", () => {
        const nonErr = null;
        expect(Err.isErr(nonErr)).toBeFalsy();
    });

    it("Should detect elaborated errors.", () => {
        const err = Err.err("test").with("test");
        expect(Err.isErr(err)).toBeTruthy();
    });
});
