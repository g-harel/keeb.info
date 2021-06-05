export class Element {
    private attributes: Record<string, string | number> = {};
    private styles: Record<string, string | number> = {};
    private children: any[] = [];

    public constructor(public tag: string) {}

    public attr(key: string, value: string | number): Element {
        this.attributes[key] = value;
        return this;
    }

    public style(key: string, value: string | number): Element {
        this.styles[key] = value;
        return this;
    }

    public child(element: Element | string): Element {
        if (typeof element === "string") {
            this.children.push({render: () => element});
        } else {
            this.children.push(element);
        }
        return this;
    }

    public render(): string {
        const attributes = this.renderAttributes();
        const content = this.renderChildren();
        if (content === "") {
            return `<${this.tag}${attributes}/>`;
        }
        return `<${this.tag}${attributes}>${content}</${this.tag}>`;
    }

    private renderAttributes(): string {
        let styleOut = "";
        const styles = Object.keys(this.styles);
        for (const style of styles) {
            styleOut += `${style}:${this.styles[style]};`;
        }
        let out = "";
        if (styleOut.length > 0) {
            out += ` style="${styleOut}"`;
        }
        const attributes = Object.keys(this.attributes);
        for (const attribute of attributes) {
            out += ` ${attribute}="${this.attributes[attribute]}"`;
        }
        return out;
    }

    private renderChildren(): string {
        let out = "";
        for (const child of this.children) {
            out += child.render();
        }
        return out;
    }
}
