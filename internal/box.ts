import {Possible, newErr} from "possible-ts";

import {Point} from "./point";
import {Composite, Shape} from "./shape";
import {multiUnion} from "./shape";

// Generic rectangular shape.
export interface Box {
    // Width of shape.
    width: number;

    // Height of shape.
    height: number;

    // Relative location for composite shapes.
    offset: Point;
}

export const toComposite = (boxes: Box[]): Composite => {
    const shapes: Composite = [];
    for (const box of boxes) {
        shapes.push(corners([0, 0], box));
    }
    return multiUnion(...shapes);
};

export const toShape = (boxes: Box[]): Possible<Shape> => {
    const m = toComposite(boxes);
    if (m.length === 0) return [];
    if (m.length > 1) return newErr("split shape");
    return m[0];
};

// Corners in ring order.
export const corners = (offset: Point, box: Box): Shape => {
    const x = box.offset[0] + offset[0];
    const y = box.offset[1] + offset[1];
    return [
        [x, y],
        [x, y + box.height],
        [x + box.width, y + box.height],
        [x + box.width, y],
    ];
};

export const pad = (box: Box, pad: number): Box => {
    return {
        width: box.width + 2 * pad,
        height: box.height + 2 * pad,
        offset: [box.offset[0] - pad, box.offset[1] - pad],
    };
};
