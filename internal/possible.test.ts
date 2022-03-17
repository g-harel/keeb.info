import {Possible, isErr, newErr} from "./possible";

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
        const value = newErr("test");
        expect(isErr(value)).toBeTruthy();
    });

    it("should detect non-errors", () => {
        const value = null;
        expect(isErr(value)).toBeFalsy();
    });

    it("should detect elaborated errors", () => {
        const value = newErr("test").err.with("test");
        expect(isErr(value)).toBeTruthy();
    });

    it("should include message in printed errors", () => {
        const testString = "abc";
        const value = newErr(testString);

        expect(value.err.print()).toContain(testString);
    });

    it("should include extended messages in printed errors", () => {
        const testStrings = ["foo", "bar", "xyz"];
        let value = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            value = value.err.with(testStrings[i]);
        }

        for (const message of testStrings) {
            expect(value.err.print()).toContain(message);
        }
    });

    it("should start with most recent extension in printed error", () => {
        const testStrings = ["123", "456", "789"];
        let value = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            value = value.err.with(testStrings[i]);
        }

        const printed = value.err.print();
        const indexes = testStrings.map((str) => printed.indexOf(str));
        expect(
            indexes.slice(1).every((item, i) => indexes[i] >= item),
        ).toBeTruthy();
    });

    it("should correctly identify an ancestor error type", () => {
        // TODO
    });

    it("cloned errs should match the error type", () => {
        // TODO
    });
});
