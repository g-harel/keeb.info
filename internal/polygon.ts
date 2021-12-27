import {intersection, MultiPolygon, union} from "polygon-clipping";

import {shapeCorners} from "./measure";
import {Pair, Shape} from "./types/base";

export const multiUnion = (...shapes: Pair[][]): Pair[][] => {
    const roundFactor = 10000000; // TODO tweak if breaking.
    shapes = shapes.map((shape) =>
        shape.map((pair) => [
            Math.round(pair[0] * roundFactor) / roundFactor,
            Math.round(pair[1] * roundFactor) / roundFactor,
        ]),
    );

    const mp: MultiPolygon = union([], ...shapes.map((lc) => [[lc]]));
    return mp.flat(1).map((poly) => poly.slice(1));
};

export const joinShapes = (shapes: Shape[]): Pair[][] => {
    const polys: Pair[][] = [];
    for (const shape of shapes) {
        polys.push(shapeCorners([0, 0], shape));
    }
    return multiUnion(...polys);
};

export const joinShape = (shapes: Shape[]): Pair[] => {
    const m = joinShapes(shapes);
    if (m.length === 0) return [];
    if (m.length > 1) throw "TODO split";
    return m[0];
};

export const doesIntersect = (a: Pair[][], b: Pair[][]): boolean => {
    const intersections = intersection(a, b);
    return !!intersections.flat(2).length;
};
