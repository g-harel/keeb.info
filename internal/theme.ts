import {DefaultTheme} from "styled-components";

interface Layer {
    [key: string]: string | Layer;
}

interface Accessor {
    (props: {theme?: DefaultTheme}): string;
}

export type AccessorLayer<G extends Layer> = {
    [N in keyof G]: G[N] extends Layer ? AccessorLayer<G[N]> : Accessor;
};

const themeAccessor =
    (path: string[]): Accessor =>
    (props) => {
        let value = props.theme;
        for (const step of path) {
            if (typeof value !== "object" || value === null) {
                console.warn(`Invalid theme access: [${path.join(",")}]`);
                return String(value);
            }
            value = (value as any)[step];
        }
        return String(value);
    };

// Values of the passed in theme are not used directly. Value is only used for
// the object's shape. This preserves the ability to swap themes.
export const createAccessorsByExample = <T extends Layer>(
    layer: T,
    path: string[] = [],
): AccessorLayer<T> => {
    const accessorLayer = {};
    for (const [key, value] of Object.entries(layer)) {
        const newPath = path.concat([key]);
        if (typeof value === "string") {
            (accessorLayer as any)[key] = themeAccessor(newPath);
            continue;
        }
        (accessorLayer as any)[key] = createAccessorsByExample(value, newPath);
    }
    return accessorLayer as any;
};
