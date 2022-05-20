import {Possible, isErr, newErr, isErrOfType} from "./possible";

test("api", () => {
    // TODO TESTING START
    // const a = (): Possible<string> => "";
    // const b = (): Possible<string> => {
    //     const aa = a();
    //     if (isErr(aa)) {
    //         const bb = aa;
    //         if (Math.random() > 0.5) {
    //             return aa.err.with("test");
    //         }
    //         const aaa = aa.err.forward();
    //         return aa;
    //     }
    //     return "";
    // };
    // TODO TESTING END
});

describe("isErr", () => {
    it("should guard the original type", () => {
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
        const value = newErr("test").err.fwd("test");
        expect(isErr(value)).toBeTruthy();
    });
});

describe("isErrOfType", () => {
    it("should be callable before the value is resolved to Err", () => {
        const ERR_TEST = newErr("foo");
        const plainErr: Possible<string> = newErr("bar") as any;
        const fwdErr: Possible<string> = ERR_TEST.fwd("baz") as any;
        const value: Possible<string> = "" as any;

        expect(isErrOfType(plainErr, ERR_TEST)).toBeFalsy();
        expect(isErrOfType(fwdErr, ERR_TEST)).toBeTruthy();
        expect(isErrOfType(value, ERR_TEST)).toBeFalsy();
    });

    it("should correctly identify all ancestor error type", () => {
        const firstErr = newErr("test");
        const secondErr = firstErr.fwd("test");
        const thirdErr = secondErr.fwd("test");
        const errs = [firstErr, secondErr, thirdErr];

        for (let i = 0; i < errs.length; i++) {
            for (let j = i; j < errs.length; j++) {
                expect(isErrOfType(errs[j], errs[i])).toBeTruthy();
            }
        }
    });
})

describe("Err", () => {
    it("should include message in printed errors", () => {
        const testString = "abc";
        const value = newErr(testString);

        expect(value.err.print()).toContain(testString);
    });

    it("should include extended messages in printed errors", () => {
        const testStrings = ["foo", "bar", "xyz"];
        let value = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            value = value.err.fwd(testStrings[i]);
        }

        for (const message of testStrings) {
            expect(value.err.print()).toContain(message);
        }
    });

    it("should start with most recent extension in printed error", () => {
        const testStrings = ["123", "456", "789"];
        let value = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            value = value.err.fwd(testStrings[i]);
        }

        const printed = value.err.print();
        const indexes = testStrings.map((str) => printed.indexOf(str));
        expect(
            indexes.slice(1).every((item, i) => indexes[i] >= item),
        ).toBeTruthy();
    });

    it("should be resistant to cycles", () => {
        const rootErr = newErr("foo");
        const cycleErr = rootErr.fwd(rootErr);
        
        expect(cycleErr.err.print()).toBe("foo: foo");
    });
});
