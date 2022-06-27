import {
    MultiPolygon,
    intersection,
    union as originalUnion,
} from "polygon-clipping";

import {CurveShape} from "./curve";
import {angleBetween, distance} from "./point";
import {Point} from "./point";

// List of Points that form a closed shape.
// Each point appears only once.
export type Shape = Point[];

// Group of shapes that represent a single entity.
export type Composite = Shape[];

export const multiUnion = (...composites: Composite): Composite => {
    const roundFactor = 10000000; // TODO tweak if breaking.
    composites = composites.map((shape) =>
        shape.map((point) => [
            Math.round(point[0] * roundFactor) / roundFactor,
            Math.round(point[1] * roundFactor) / roundFactor,
        ]),
    );

    const mp: MultiPolygon = originalUnion(
        [],
        ...composites.map((lc) => [[lc]]),
    );
    return mp.flat(1).map((poly) => poly.slice(1));
};

export const doesIntersect = (a: Composite, b: Composite): boolean => {
    // Sort lists to compare simplest shapes first.
    const aSorted = a.slice().sort((x, y) => x.length - y.length);
    const bSorted = b.slice().sort((x, y) => x.length - y.length);
    for (const aShape of aSorted) {
        for (const bShape of bSorted) {
            const intersections = intersection([aShape], [bShape]);
            if (!!intersections.flat(2).length) {
                return true;
            }
        }
    }
    return false;
};

export const toSVGPath = (shape: Shape): string => {
    let path = "";
    for (let i = 0; i < shape.length; i++) {
        const [start, end] = shape[i];
        path += `${i === 0 ? "M" : "L"} ${start} ${end} `;
    }
    path += "Z";
    return path;
};

export const round = (
    shape: Shape,
    radius: number,
    concaveRadius: number,
): CurveShape => {
    const points: CurveShape = [];
    const safePoly = [shape[shape.length - 1], ...shape, shape[0]];
    for (let i = 1; i < safePoly.length - 1; i++) {
        const before = safePoly[i - 1];
        const current = safePoly[i];
        const after = safePoly[i + 1];

        const angle = angleBetween(before, after, current) / 2;
        const chopLength =
            (angle > 0 ? radius : concaveRadius) / Math.cos(angle);

        let beforeFraction = chopLength / distance(before, current);
        if (beforeFraction > 0.5) beforeFraction = 0.5;
        const start: Point = [
            before[0] + (1 - beforeFraction) * (current[0] - before[0]),
            before[1] + (1 - beforeFraction) * (current[1] - before[1]),
        ];

        let afterFraction = chopLength / distance(after, current);
        if (afterFraction > 0.5) afterFraction = 0.5;
        const end: Point = [
            after[0] + (1 - afterFraction) * (current[0] - after[0]),
            after[1] + (1 - afterFraction) * (current[1] - after[1]),
        ];

        points.push([start, current, end]);
    }
    return points;
};

const rotateArray = <T>(a: T[], count: number): T[] => {
    if (count === 0) return a;
    count = count % a.length;
    return a.slice(count, a.length).concat(a.slice(0, count));
};

// TODO 2022-06-20 avoid expensive rotation with mods
export const equalComposite = (a: Composite, b: Composite): boolean => {
    if (a.length !== b.length) return false;
    if (a.length === 0) return true;
    for (let i = 0; i < b.length; i++) {
        const rB = rotateArray(b, i);
        let eq = true;
        for (let j = 0; j < rB.length; j++) {
            if (!equalShape(a[j], rB[j])) {
                eq = false;
                break;
            }
        }
        if (eq) return true;
    }
    return false;
};

// TODO 2022-06-20 avoid expensive rotation with mods
export const equalShape = (a: Shape, b: Shape): boolean => {
    if (a.length !== b.length) return false;
    if (a.length === 0) return true;
    for (let i = 0; i < b.length; i++) {
        const rB = rotateArray(b, i);
        let eq = true;
        for (let j = 0; j < rB.length; j++) {
            if (!equalPoint(a[j], rB[j])) {
                eq = false;
                break;
            }
        }
        if (eq) return true;
    }
    return false;
};

export const equalPoint = (a: Point, b: Point): boolean => {
    return a[0] === b[0] && a[1] === b[1];
};
