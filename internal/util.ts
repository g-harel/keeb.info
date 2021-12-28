import {Box} from "./measure";
import {Point} from "./primitives";

export const genID = (
    namespace: string,
    info: {
        base?: Box[];
        shelf?: Box[];
        color?: string;
        position?: Point;
        angle?: number;
    },
): string => {
    let components: any[] = [namespace];
    components = components.concat(
        [...(info.base || []), ...(info.shelf || [])]
            .map((box) => [box.height, box.width, box.offset])
            .flat(Infinity),
    );
    components = components.concat((info.color ? [info.color] : []) as any);
    components = components.concat(info.position ? [info.position] : []);
    components = components.concat(info.angle ? [info.angle] : []);
    return components.join("/").toUpperCase();
};
