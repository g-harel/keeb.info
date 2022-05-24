export type Possible<T> = T | Err | UnresolvedErr;
export type AsyncPossible<T> = Promise<Possible<T>>;

const GLOBAL_ERR_IDENTITY = {};

// TODO 2022-05-20 internal Err wrapper for typesafe access (remove all "as any")

// TODO 2022-05-20 builder that works better with try/catch
export const newErr = (message: string): Err => {
    return new Err(null, message, null);
};

export const isErr = (value: any): value is Err | UnresolvedErr => {
    return (
        (value as any) && (value as any).$globalIdentity === GLOBAL_ERR_IDENTITY
    );
};

// TODO 2022-05-20 should this also traverse err ancestry?
// TODO 2022-05-20 should this restrict err ancestry depth to 0?
export const isErrOfType = (
    value: any,
    err: Err,
): value is Err | UnresolvedErr => {
    if (!isErr(value)) return false;
    return (value as any)
        .nextErrs()
        .find((e: Err) => (e as any).$identity === (err as any).$identity);
};

interface IErr {
    decorate: (messageOrErr: string | Err) => Err;
    print: () => string;
}

// To dissalow confusing calls to "isErr" guarded Possible values.
//     <allowed> possibleValue.err.print();
// <not allowed> possibleValue.print();
// <not allowed> possibleValue.err.err;
class UnresolvedErr {
    public err!: IErr;
    public fwd!: unknown;
    public print!: unknown;
}

// TODO make serializable across runs.
class Err implements IErr {
    public err = this;
    private $globalIdentity = GLOBAL_ERR_IDENTITY;

    private readonly $identity: {};
    private readonly message: string;
    private readonly nextErr: Err | null = null;

    constructor($identity: {} | null, message: string, nextErr: Err | null) {
        this.$identity = $identity || Math.random();
        this.message = message;
        this.nextErr = nextErr;
    }

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

    // TODO find better name
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
