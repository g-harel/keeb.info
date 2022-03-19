export type Possible<T> = T | Err;

const globalErrIdentity = {};

export const newErr = (message: string): Err => {
    return new Err({$identity: null, message, nextErr: null});
};

export const isErr = (value: any): value is Err => {
    return (
        (value as any) && (value as any).$globalIdentity === globalErrIdentity
    );
};

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

// TODO add error type and type checking (ex. NotFoundErr)
// TODO force "value.err" to be used even when returning plain err
class Err {
    public err = this;
    private $globalIdentity = globalErrIdentity;

    private readonly $identity: {};
    private readonly message: string;
    private readonly nextErr: Err | null = null;

    constructor(values: {
        $identity: {} | null;
        message: string;
        nextErr: Err | null;
    }) {
        this.$identity = values.$identity || {};
        this.message = values.message;
        this.nextErr = values.nextErr;
    }

    // TODO find better name
    public fwd(messageOrErr: string | Err): Err {
        if (typeof messageOrErr === "string") {
            return new Err({
                $identity: null,
                message: messageOrErr,
                nextErr: this,
            });
        } else {
            // TODO test this
            return new Err({
                $identity: messageOrErr.$identity,
                message: messageOrErr.message,
                nextErr: this,
            });
        }
    }

    // TODO err list iteration helper
    public is(err: Err) {
        let cur: Err = this;
        while (cur.nextErr !== null) {
            if (cur.$identity === (err as any).$identity) {
                return true;
            }
            cur = cur.nextErr;
        }
        return cur.$identity === (err as any).$identity;
    }

    public print(): string {
        let cur: Err = this;
        const messages: string[] = [];
        while (cur.nextErr !== null) {
            messages.push(cur.message);
            cur = cur.nextErr;
        }
        messages.push(cur.message);
        return messages.join(": ");
    }
}
