import {Err, isErr, newErr, Possible} from "./possible";

describe("Err", () => {
    it("should assert the type", () => {
        const testValue = {test: true};
        const possibleErr: Possible<typeof testValue> = testValue;

        if (isErr(possibleErr)) {
            expect(isErr(possibleErr)).toBeFalsy();
        }
        expect(possibleErr.test).toBeTruthy(); // Type check.
    });

    it("should detect errors", () => {
        const err = newErr("test");
        expect(isErr(err)).toBeTruthy();
    });

    it("should detect non-errors", () => {
        const nonErr = null;
        expect(isErr(nonErr)).toBeFalsy();
    });

    it("should detect elaborated errors", () => {
        const err = newErr("test").with("test");
        expect(isErr(err)).toBeTruthy();
    });

    it("should inlcude message in printed errors", () => {
        const testString = "abc";
        const err = newErr(testString);

        expect(err.print()).toContain(testString);
    });

    it("should include extended messages in printed errors", () => {
        const testStrings = ["foo", "bar", "xyz"];
        let err = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            err = err.with(testStrings[i]);
        }

        for (const message of testStrings) {
            expect(err.print()).toContain(message);
        }
    });

    it("should start with most recent extension in printed error", () => {
        const testStrings = ["123", "456", "789"];
        let err = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            err = err.with(testStrings[i]);
        }

        const printed = err.print();
        const indexes = testStrings.map((str) => printed.indexOf(str));
        expect(
            indexes.slice(1).every((item, i) => indexes[i] >= item),
        ).toBeTruthy();
    });
});
