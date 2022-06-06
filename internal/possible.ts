export type Possible<T> = T | Err | UnresolvedErr;
export type AsyncPossible<T> = Promise<Possible<T>>;

// Create a new `Err` with the given message.
export const newErr = (message: string): Err => {
    return new Err(null, message, null);
};

// Type guard to check if a `Possible` value is an `Err`.
export const isErr = (value: any): value is Err | UnresolvedErr => {
    return value instanceof Err;
};

// Type guard to check if a `Possible` value is an `Err` that also matches the
// matcher type. All the ancestor types of the `value` will be compared to only
// the most recent identiy of the `matcher`.
export const isErrOfType = (
    value: any,
    matcher: Err,
): value is Err | UnresolvedErr => {
    if (!isErr(value)) return false;

    const pValue: IPrivateErr = value as any;
    const pMatcher: IPrivateErr = matcher as any;

    return !!pValue
        .nextErrs()
        .find((e) => e.$possible_identity === pMatcher.$possible_identity);
};

// Helper to rap expressions that might produce `Error`s that are not native to
// this package. Input can be a function that might throw, or a `Promise` that
// might get rejected.
// It is not recommended for the expression to return a `Possible` since this
// mixes error handling and results in wrapped `Possible`s.
export function mightErr<T>(expr: Promise<T>): AsyncPossible<T>;
export function mightErr<T>(expr: () => T): Possible<T>;
export function mightErr<T>(
    expr: Promise<T> | (() => T),
): Possible<T> | AsyncPossible<T> {
    // Expression is a callback.
    if (typeof expr === "function") {
        try {
            return expr();
        } catch (e) {
            return newErr(String(e));
        }
    }

    // Expression is a promise.
    if (typeof expr.catch === "function" && typeof expr.then === "function") {
        return new Promise<Possible<T>>(async (resolve) => {
            await expr
                .then((v) => resolve(v))
                .catch((e) => resolve(newErr(String(e))));
        });
    }

    return expr as any;
}

// Internal helper that captures the public `Err` API without the .err member.
// It is used to restrict repeated chains of .err.err...
interface IErr {
    describe: (messageOrErr: string | Err) => Err;
    print: () => string;
}

// Internal helper to expose private `Err` api to helper methods.
interface IPrivateErr extends IErr {
    $possible_globalIdentity: any;
    $possible_identity: any;
    nextErrs(): IPrivateErr[];
}

// To disallow confusing calls to `isErr` guarded Possible values.
//     <allowed> possibleValue.err.print();
// <not allowed> possibleValue.print();
// <not allowed> possibleValue.err.err;
class UnresolvedErr {
    public err!: IErr;
    public describe!: void;
    public print!: void;
}

class Err implements IErr {
    public err = this;

    private readonly $possible_identity: number;
    private readonly message: string;
    private readonly nextErr: Err | null = null;

    constructor(
        $possible_identity: number | null,
        message: string,
        nextErr: Err | null,
    ) {
        this.$possible_identity = $possible_identity || Math.random();
        this.message = message;
        this.nextErr = nextErr;
    }

    // Utility to traverse `Err` ancestry and convert it into an array.
    // In order of most distant ancestor first.
    private nextErrs(): Err[] {
        let cur: Err = this;
        const errs: Err[] = [];
        while (cur.nextErr !== null) {
            errs.push(cur);
            cur = cur.nextErr;
        }
        errs.push(cur);
        return errs;
    }

    // Wrap the `Err` instance to add more context. When printed, the described
    // message will be formatted as: `<described message>: <original message>`.
    public describe(messageOrErr: string | Err): Err {
        if (typeof messageOrErr === "string") {
            return new Err(null, messageOrErr, this);
        }
        return new Err(
            messageOrErr.$possible_identity,
            messageOrErr.message,
            this,
        );
    }

    // Print the error with all the described messages and `Err`s in order.
    // <example> newErr("a").describe("b").describe("c").print()
    //  <output> c: b: a
    public print(): string {
        return this.nextErrs()
            .map((e) => e.message)
            .join(": ");
    }
}
