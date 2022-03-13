export type Possible<T> = T | ErrContainer;

const internalIdentity = {};

export const newErr = (message: string): ErrContainer => {
    const container = new ErrContainer();
    container.err = new Err();
    (container.err as any).messages = [message];
    return container;
};

export const isErr = <T>(value: Possible<T>): value is ErrContainer => {
    return (
        value &&
        (value as any).err &&
        (value as any).$__internal__identity__ === internalIdentity
    );
};

export class ErrContainer {
    private $__internal__identity__ = internalIdentity;
    public err!: Err;
}

// TODO add error type and type checking (ex. NotFoundErr)
// TODO force "value.err" to be used even when returning plain err.
class Err {
    private messages: string[] = [];

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
