export type Possible<T> = T | ErrContainer;

const internalIdentity = {};

export const newErr = (message: string): ErrContainer => {
    const container = new InternalErrContainer();
    container.err = new Err();
    (container.err as any).messages = [message];
    return container;
};

export const isErr = (value: any): value is UnresolvedErrContainer => {
    return (
        (value as any) !== undefined &&
        (value as any).$__internal__identity__ === internalIdentity &&
        (value as any).err
    );
};

interface UnresolvedErrContainer {
    err: Err;
};

interface ErrContainer {
    val: string;
    err: Err;
}

class InternalErrContainer implements ErrContainer {
    private $__internal__identity__ = internalIdentity;
    public val = "";
    public err!: Err;
}

// TODO TESTING START
const a = (): Possible<string> => "";
const b = (): Possible<string> => {
    const aa = a();
    if (isErr(aa)) {
        const bb = aa;
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
        const container = new InternalErrContainer();
        container.err = this;
        return container;
    }

    public with(message: string): ErrContainer {
        const container = new InternalErrContainer();
        container.err = new Err();
        container.err.messages = [message, ...this.messages];
        return container;
    }

    public print(): string {
        return this.messages.join(": ");
    }
}
