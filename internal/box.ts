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

export const toShape = (boxes: Box[]): Shape => {
    const m = toComposite(boxes);
    if (m.length === 0) return [];
    if (m.length > 1) console.warn("Split or holes.");
    return m[0];
};

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
