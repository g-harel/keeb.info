import {MultiPolygon, intersection, union} from "polygon-clipping";

import {Box, corners} from "./measure";
import {Shape} from "./primitives";

export const multiUnion = (...shapes: Shape[]): Shape[] => {
    const roundFactor = 10000000; // TODO tweak if breaking.
    shapes = shapes.map((shape) =>
        shape.map((point) => [
            Math.round(point[0] * roundFactor) / roundFactor,
            Math.round(point[1] * roundFactor) / roundFactor,
        ]),
    );

    const mp: MultiPolygon = union([], ...shapes.map((lc) => [[lc]]));
    return mp.flat(1).map((poly) => poly.slice(1));
};

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

export const doesIntersect = (a: Shape[], b: Shape[]): boolean => {
    const intersections = intersection(a, b);
    return !!intersections.flat(2).length;
};
