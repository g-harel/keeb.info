import {Box} from "./measure";
import {Pair} from "./units";

export const genID = (
    namespace: string,
    info: {
        base?: Box[];
        shelf?: Box[];
        color?: string;
        position?: Pair;
        angle?: number;
    },
): string => {
    let components: any[] = [namespace];
    components = components.concat(
        [...(info.base || []), ...(info.shelf || [])]
            .map((shape) => [shape.height, shape.width, shape.offset])
            .flat(Infinity),
    );
    components = components.concat((info.color ? [info.color] : []) as any);
    components = components.concat(info.position ? [info.position] : []);
    components = components.concat(info.angle ? [info.angle] : []);
    return components.join("/").toUpperCase();
};
