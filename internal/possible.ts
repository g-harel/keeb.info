export type Possible<T> = T | ErrContainer;

const internalIdentity = {};


export const newErr = (message: string) => {
    const err = new Err();
    (err as any).messages = [message];
    return err;
}

export const isErr = <T>(value: Possible<T>): value is ErrContainer => {
    return (
        value && (value as any).err && (value as any).$__internal__identity__ === internalIdentity
    );
}

export class ErrContainer {
    private $__internal__identity__ = internalIdentity;
    public err: Err | undefined;
}

// TODO add error type and type checking (ex. NotFoundErr)
export class Err {
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
