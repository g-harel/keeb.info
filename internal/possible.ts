export type Possible<T> = T | Err;

const globalErrIdentity = {};

export const newErr = (messageOrErr: string | Err): Err => {
    if (typeof messageOrErr === "string") {
        return new Err(messageOrErr);
    } else {
        return new Err("TODO copy");
    }
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
// TODO force "value.err" to be used even when returning plain err.
// TODO make sure errors can be reused without sharing arrays and refs.
// TODO remove container.
class Err {
    public err = this;
    private $globalIdentity = globalErrIdentity;

    private $identity: {};
    private message: string;
    private nextErr: Err | null = null;

    constructor(message: string, nextErr: Err | null = null) {
        this.$identity = {};
        this.message = message;
        this.nextErr = nextErr;
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

    public with(message: string): Err {
        return new Err(message, this);
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
