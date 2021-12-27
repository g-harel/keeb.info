import * as c from "../editor/cons";
import {KeysetKit, Pair, Shape} from "./types/base";
import {Layout, LayoutKey} from "./types/base";
import {rotateCoord} from "./math";

// Corners in ring order.
export const shapeCorners = (offset: Pair, shape: Shape): Pair[] => {
    const x = shape.offset[0] + offset[0];
    const y = shape.offset[1] + offset[1];
    const width = shape.width;
    const height = shape.height;
    return [
        [x, y],
        [x, y + height],
        [x + width, y + height],
        [x + width, y],
    ];
};

export const minmaxKeysetKit = (kit: KeysetKit): [Pair, Pair] => {
    const coords: Pair[] = [];
    for (const key of kit.keys) {
        for (const shape of key.key.shape) {
            coords.push(...shapeCorners(key.position, shape));
        }
    }

    let min: Pair = [Infinity, Infinity];
    let max: Pair = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};

export const minmaxLayout = (layout: Layout): [Pair, Pair] => {
    const keys: LayoutKey[] = layout.fixedKeys.slice();
    for (const section of layout.variableKeys) {
        for (const option of section.options) {
            keys.push(...option.keys);
        }
    }
    const coords: Pair[] = [];
    for (const key of keys) {
        for (const shape of key.key.shape) {
            coords.push(
                ...shapeCorners(key.position, shape).map((corner) =>
                    rotateCoord(corner, c.ROTATION_ORIGIN, key.angle),
                ),
            );
        }
    }

    let min: Pair = [Infinity, Infinity];
    let max: Pair = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};

// TODO tests
