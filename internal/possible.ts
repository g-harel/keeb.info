export type Possible<T> = T | Err | UnresolvedErr;
export type AsyncPossible<T> = Promise<Possible<T>>;

const GLOBAL_ERR_IDENTITY = "xX_pOsSiBlE_Xx";

// TODO 2022-05-20 builder that works better with try/catch
export const newErr = (message: string): Err => {
    return new Err(null, message, null);
};

// Type guard to check if a `Possible` value is an `Err`.
export const isErr = (value: any): value is Err | UnresolvedErr => {
    const pValue: IPrivateErr = value as any;
    return pValue && pValue.$possible_globalIdentity === GLOBAL_ERR_IDENTITY;
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

// Internal helper that captures the public `Err` API without the .err member.
// It is used to restrict repeated chains of .err.err...
interface IErr {
    decorate: (messageOrErr: string | Err) => Err;
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
    public fwd!: unknown;
    public print!: unknown;
}

class Err implements IErr {
    public err = this;

    private readonly $possible_globalIdentity = GLOBAL_ERR_IDENTITY;
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

    // Wrap the `Err` instance to add more context. When printed, the decorated
    // message will be formatted as: `<decorated message>: <original message>`.
    public decorate(messageOrErr: string | Err): Err {
        if (typeof messageOrErr === "string") {
            return new Err(null, messageOrErr, this);
        }
        return new Err(
            messageOrErr.$possible_identity,
            messageOrErr.message,
            this,
        );
    }

    // Print the error with all the decorated messages and `Err`s in order.
    // <example> newErr("a").decorate("b").decorate("c").print()
    //  <output> c: b: a
    public print(): string {
        return this.nextErrs()
            .map((e) => e.message)
            .join(": ");
    }
}
