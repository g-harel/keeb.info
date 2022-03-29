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

// TODO identity is not serializable.
// TODO force "value.err" to be used even when returning plain err
class Err {
    public err = this;
    private $globalIdentity = globalErrIdentity;

    private readonly $identity: {};
    private readonly message: string;
    private readonly nextErr: Err | null = null;

    constructor($identity: {} | null, message: string, nextErr: Err | null) {
        this.$identity = $identity || {};
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
    public fwd(messageOrErr: string | Err): Err {
        if (typeof messageOrErr === "string") {
            return new Err(null, messageOrErr, this);
        }
        // TODO test this
        return new Err(messageOrErr.$identity, messageOrErr.message, this);
    }

    public is(err: Err) {
        return !!this.nextErrs().find(
            (e) => (err as any).$identity === e.$identity,
        );
    }

    public print(): string {
        return this.nextErrs()
            .map((e) => e.message)
            .join(": ");
    }
}

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
