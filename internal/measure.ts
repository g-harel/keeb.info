import * as c from "../editor/cons";
import {Box} from "./box";
import {KeysetKit} from "./keyset";
import {Layout, LayoutKey} from "./layout";
import {rotateCoord} from "./math";
import {Point} from "./primitives";
import {Shape} from "./shape";

// Corners in ring order.
export const corners = (offset: Point, box: Box): Shape => {
    const x = box.offset[0] + offset[0];
    const y = box.offset[1] + offset[1];
    const width = box.width;
    const height = box.height;
    return [
        [x, y],
        [x, y + height],
        [x + width, y + height],
        [x + width, y],
    ];
};

export const minmaxKeysetKit = (kit: KeysetKit): [Point, Point] => {
    const coords: Point[] = [];
    for (const key of kit.keys) {
        for (const box of key.key.boxes) {
            coords.push(...corners(key.position, box));
        }
    }

    let min: Point = [Infinity, Infinity];
    let max: Point = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};

export const minmaxLayout = (layout: Layout): [Point, Point] => {
    const keys: LayoutKey[] = layout.fixedKeys.slice();
    for (const section of layout.variableKeys) {
        for (const option of section.options) {
            keys.push(...option.keys);
        }
    }
    const coords: Point[] = [];
    for (const key of keys) {
        for (const box of key.key.boxes) {
            coords.push(
                ...corners(key.position, box).map((corner) =>
                    rotateCoord(corner, c.ROTATION_ORIGIN, key.angle),
                ),
            );
        }
    }

    let min: Point = [Infinity, Infinity];
    let max: Point = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};
