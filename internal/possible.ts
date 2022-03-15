export type Possible<T> = T | ErrContainer;

const internalIdentity = {};

export const newErr = (message: string): ErrContainer => {
    const container = new ErrContainer();
    container.err = new Err();
    (container.err as any).messages = [message];
    return container;
};

export const isErr = <T>(value: T | UnresolvedErrContainer): value is UnresolvedErrContainer => {
    return (
        value &&
        (value as any).err &&
        (value as any).$__internal__identity__ === internalIdentity
    );
};

export interface UnresolvedErrContainer {
    err: Err;
}

export class ErrContainer  {
    private $__internal__identity__ = internalIdentity;
    public err!: Err;
}

// TODO TESTING START
const a = (): Possible<string> => {
    return "";
}
const b = (): Possible<string> => {
    const aa = a();
    if (isErr(aa)) {
        if (Math.random() > 0.5) {
            return aa.err.with("test");
        }
        const aaa = aa.err.forward();
        return aa;
    }
    return "";
};
// TODO TESTING END

// TODO add error type and type checking (ex. NotFoundErr)
// TODO force "value.err" to be used even when returning plain err.
class Err {
    private messages: string[] = [];

    public forward(): ErrContainer {
        const container = new ErrContainer();
        container.err = this;
        return container;
    }

    public with(message: string): ErrContainer {
        const container = new ErrContainer();
        container.err = new Err();
        container.err.messages = [message, ...this.messages];
        return container;
    }

    public print(): string {
        return this.messages.join(": ");
    }
}
