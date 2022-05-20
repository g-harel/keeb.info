export type Possible<T> = T | Err;

// TODO async
export type Promible<T> = Promise<Possible<T>>;
export type Possmise<T> = Possible<Promise<T>>;

const globalErrIdentity = {};

// TODO builder that works better with try/catch
export const newErr = (message: string): Err => {
    return new Err(null, message, null);
};

export const isErr = (value: any): value is Err => {
    return (
        (value as any) && (value as any).$globalIdentity === globalErrIdentity
    );
};

export const isErrOfType = (value: any, err: Err): value is Err => {
    if (!isErr(value)) return false;
    return (value as any).nextErrs().find(
        (e: Err) => (e as any).$identity === (err as any).$identity,
    );
};

// TODO identity is not serializable.
// TODO 2022-05-18 force "value.err" to be used even when returning plain err. remove otherwise
class Err {
    public err = this;
    private $globalIdentity = globalErrIdentity;

    private readonly $identity: {};
    private readonly message: string;
    private readonly nextErr: Err | null = null;

    constructor($identity: {} | null, message: string, nextErr: Err | null) {
        this.$identity = $identity || Math.random();
        this.message = message;
        this.nextErr = nextErr;
    }

    // TODO 2022-05-18 cycle protection
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
    public fwd(messageOrErr: string | Err): Err {
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
