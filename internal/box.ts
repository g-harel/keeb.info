import {corners} from "./measure";
import {Point} from "./primitives";
import {Shape} from "./shape";
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

export const toShapes = (boxes: Box[]): Shape[] => {
    const polys: Shape[] = [];
    for (const box of boxes) {
        polys.push(corners([0, 0], box));
    }
    return multiUnion(...polys);
};

export const toSingleShape = (boxes: Box[]): Shape => {
    const m = toShapes(boxes);
    if (m.length === 0) return [];
    if (m.length > 1) throw "TODO split";
    return m[0];
};
