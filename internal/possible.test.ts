import {Possible, isErr, isErrOfType, mightErr, newErr} from "./possible";

test("api", () => {
    // TODO TESTING START
    const a = (): Possible<string> => "";
    const b = (): Possible<string> => {
        const aa = a();
        if (isErr(aa)) {
            const bb = aa;
            if (Math.random() > 0.5) {
                return aa.err.decorate("test");
            }
            const aaa = aa.err.decorate("");
            return aa;
        }
        return "";
    };
    const c: Possible<string> = a();
    let d: Possible<string> = a();
    if (isErrOfType(c, newErr(""))) {
        d = c;
        // c.print();
        c.err.print();
        // c.err.err.err;
    }
    if (isErr(c)) return;
    c.length;
    // TODO TESTING END
});

const testStr = () => String(Math.random());

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
        const value = newErr(testStr());
        expect(isErr(value)).toBeTruthy();
    });

    it("should detect non-errors", () => {
        const value = null;
        expect(isErr(value)).toBeFalsy();
    });

    it("should detect decorated errors", () => {
        const value = newErr(testStr()).err.decorate(testStr());
        expect(isErr(value)).toBeTruthy();
    });
});

describe("isErrOfType", () => {
    it("should be callable before the value is resolved to Err", () => {
        const ERR_TEST = newErr(testStr());
        const plainErr: Possible<string> = newErr(testStr());
        const decorateErr: Possible<string> = ERR_TEST.decorate(testStr());
        const value: Possible<string> = "";

        expect(isErrOfType(plainErr, ERR_TEST)).toBeFalsy();
        expect(isErrOfType(decorateErr, ERR_TEST)).toBeTruthy();
        expect(isErrOfType(value, ERR_TEST)).toBeFalsy();
    });

    it("should correctly identify all ancestor error type", () => {
        const firstErr = newErr(testStr());
        const secondErr = firstErr.decorate(testStr());
        const thirdErr = secondErr.decorate(testStr());
        const errs = [firstErr, secondErr, thirdErr];

        for (let i = 0; i < errs.length; i++) {
            for (let j = i; j < errs.length; j++) {
                expect(isErrOfType(errs[j], errs[i])).toBeTruthy();
            }
        }
    });
});

describe("mightErr", () => {
    it("should return the value if it is neither a callback or a promise", () => {
        const testString: any = testStr();
        expect(mightErr(testString)).toBe(testString);
    });

    it("should return the callback value", () => {
        const testString = testStr();
        expect(mightErr(() => testString)).toBe(testString);
    });

    it("should return the promise value", async () => {
        const testString = testStr();
        expect(await mightErr(new Promise((res) => res(testString)))).toBe(
            testString,
        );
    });

    it("should wrap callback exceptions", () => {
        const testString = testStr();
        const possible = mightErr(() => {
            throw testString;
        });
        expect(isErr(possible)).toBeTruthy();
        expect(possible.err.print()).toContain(testString);
    });

    it("should wrap promise exceptions", async () => {
        const testString = testStr();
        const possible = await mightErr(
            new Promise(() => {
                throw testString;
            }),
        );
        expect(isErr(possible)).toBeTruthy();
        expect((possible as any).err.print()).toContain(testString);
    });

    it("should wrap promise rejections", async () => {
        const testString = testStr();
        const possible = await mightErr(new Promise((_, r) => r(testString)));
        expect(isErr(possible)).toBeTruthy();
        expect((possible as any).err.print()).toContain(testString);
    });
});

describe("Err", () => {
    it("should include message in printed errors", () => {
        const testString = testStr();
        const value = newErr(testString);

        expect(value.err.print()).toContain(testString);
    });

    it("should include extended messages in printed errors", () => {
        const testStrings = [testStr(), testStr(), testStr()];
        let value = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            value = value.err.decorate(testStrings[i]);
        }

        for (const message of testStrings) {
            expect(value.err.print()).toContain(message);
        }
    });

    it("should start with most recent extension in printed error", () => {
        const testStrings = [testStr(), testStr(), testStr()];
        let value = newErr(testStrings[0]);
        for (let i = 1; i < testStrings.length; i++) {
            value = value.err.decorate(testStrings[i]);
        }

        const printed = value.err.print();
        const indexes = testStrings.map((str) => printed.indexOf(str));
        expect(
            indexes.slice(1).every((item, i) => indexes[i] >= item),
        ).toBeTruthy();
    });

    it("should be resistant to cycles", () => {
        const testString = testStr();
        const rootErr = newErr(testString);
        const cycleErr = rootErr.decorate(rootErr);

        expect(cycleErr.err.print()).toBe(`${testString}: ${testString}`);
    });
});
