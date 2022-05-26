export type Possible<T> = T | Err | UnresolvedErr;
export type AsyncPossible<T> = Promise<Possible<T>>;

const GLOBAL_ERR_IDENTITY = {};

// TODO 2022-05-20 internal Err wrapper for type-safe access (remove all "as any")

// TODO 2022-05-20 builder that works better with try/catch
export const newErr = (message: string): Err => {
    return new Err(null, message, null);
};

// Type guard to check if a `Possible` value is an `Err`.
export const isErr = (value: any): value is Err | UnresolvedErr => {
    return (
        (value as any) && (value as any).$globalIdentity === GLOBAL_ERR_IDENTITY
    );
};

// Type guard to check if a `Possible` value is an `Err` that also matches the
// matcher type. All the ancestor types of the `value` will be compared to only
// the most recent identiy of the `matcher`.
export const isErrOfType = (
    value: any,
    matcher: Err,
): value is Err | UnresolvedErr => {
    if (!isErr(value)) return false;
    return (value as any)
        .nextErrs()
        .find((e: Err) => (e as any).$identity === (matcher as any).$identity);
};

// Internal helper that captures the public `Err` API without the .err member.
// It is used to restrict repeated chains of .err.err...
interface IErr {
    decorate: (messageOrErr: string | Err) => Err;
    print: () => string;
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

    // TODO make serializable across runs.
    private readonly $globalIdentity = GLOBAL_ERR_IDENTITY;
    private readonly $identity: {};

    private readonly message: string;
    private readonly nextErr: Err | null = null;

    constructor($identity: {} | null, message: string, nextErr: Err | null) {
        this.$identity = $identity || Math.random();
        this.message = message;
        this.nextErr = nextErr;
    }

    // Utility to traverse `Err` ancestry and convert it into an array.
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
        return new Err(messageOrErr.$identity, messageOrErr.message, this);
    }

    public print(): string {
        return this.nextErrs()
            .map((e) => e.message)
            .join(": ");
    }
}
