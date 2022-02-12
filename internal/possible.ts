const internalIdentity = {};

export class Err {
    public static isErr(value: Possible<any>): value is Err {
        return (
            value && (value as Err).$__internal__identity__ === internalIdentity
        );
    }

    public static err(message: string) {
        const err = new Err();
        err.messages = [message];
        return err;
    }

    //

    private $__internal__identity__ = internalIdentity;
    private messages: string[] = [];

    public with(message: string): Err {
        const err = new Err();
        err.messages = [message, ...this.messages];
        return err;
    }

    public print(): string {
        return this.messages.join(": ");
    }
}

export type Possible<T> = T | Err;
