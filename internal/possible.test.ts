import {Err, Possible} from "./possible";

describe("Err", () => {
    // TODO make table of values.
    it("Should assert the type.", () => {
        const testValue = {test: true};
        const possibleErr: Possible<typeof testValue> = testValue;

        if (Err.isErr(possibleErr)) {
            expect(Err.isErr(possibleErr)).toBeFalsy();
        }
        expect(possibleErr.test).toBeTruthy(); // Type check.
    });

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

    it("Should inlcude message in printed errors.", () => {
        const testString = "abc";
        const err = Err.err(testString);

        expect(err.print()).toContain(testString);
    });

    it("Should include extended messages in printed errors.", () => {
        const testStrings = ["foo", "bar", "xyz"];
        let err = Err.err(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            err = err.with(testStrings[i]);
        }

        for (const message of testStrings) {
            expect(err.print()).toContain(message);
        }
    });
});
