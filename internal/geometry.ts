import { MultiPolygon, Polygon, union } from "polygon-clipping";
import { shapeCorners, toPair } from "./measure";

import {Angle, Cartesian, Pair, QuadPoint, Shape} from "./types/base";

export const distance = (a: Pair, b: Pair): number => {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};

export const angleBetween = (a: Pair, b: Pair, center: Pair): number => {
    const dAx = center[0] - a[0];
    const dAy = center[1] - a[1];
    const dBx = b[0] - center[0];
    const dBy = b[1] - center[1];
    return Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
};

export const round = (
    shape: Pair[],
    radius: number,
    concaveRadius: number,
): QuadPoint[] => {
    const points: QuadPoint[] = [];
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
        const start: Pair = [
            before[0] + (1 - beforeFraction) * (current[0] - before[0]),
            before[1] + (1 - beforeFraction) * (current[1] - before[1]),
        ];

        let afterFraction = chopLength / distance(after, current);
        if (afterFraction > 0.5) afterFraction = 0.5;
        const end: Pair = [
            after[0] + (1 - afterFraction) * (current[0] - after[0]),
            after[1] + (1 - afterFraction) * (current[1] - after[1]),
        ];

        points.push([start, current, end]);
    }
    return points;
};

export const split = (percentage: number, a: number, b: number): number => {
    return a + percentage * (b - a);
};

export const splitLine = (percentage: number, a: Pair, b: Pair): Pair => {
    return [split(percentage, a[0], b[0]), split(percentage, a[1], b[1])];
};

export const splitQuadCurve = (point: QuadPoint, percentage: number): Pair => {
    const [p0, p1, p2] = point;
    return splitLine(
        percentage,
        splitLine(percentage, p0, p1),
        splitLine(percentage, p1, p2),
    );
};

export const approx = (rounded: QuadPoint[], resolution: number): Pair[] => {
    const points: Pair[] = [];
    for (const point of rounded) {
        for (let p = 0; p <= 1; p += resolution) {
            points.push(splitQuadCurve(point, p));
        }
    }
    return points;
};

export const straightPath = (points: Pair[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [start, end] = points[i];
        path += `${i === 0 ? "M" : "L"} ${start} ${end} `;
    }
    path += "Z";
    return path;
};

export const roundedPath = (points: QuadPoint[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [rStart, point, rEnd] = points[i];
        path += `${i === 0 ? "M" : "L"} ${rStart[0]} ${rStart[1]} `;
        path += `Q ${point[0]} ${point[1]} ${rEnd[0]} ${rEnd[1]} `;
    }
    path += "Z";
    return path;
};

export const convertCartesianToAngle = (c: Cartesian): Angle => {
    let angle = 0;
    if (c[0]) angle -= 90;
    if (c[1]) angle += 180;
    return angle;
};

export const bridgeArcs = (count: number, a: QuadPoint, b: QuadPoint) => {
    const lines: [Pair, Pair][] = [];
    for (let i = 0; i <= count; i++) {
        const percentage = i / count;
        lines.push([
            splitQuadCurve(a, percentage),
            splitQuadCurve(b, percentage),
        ]);
    }
    return lines;
};

export const multiUnion = (...shapes: Pair[][]): Pair[][] => {
    const roundFactor = 10000000; // TODO tweak if breaking.
    const roundedShapes: typeof shapes = shapes.map((shape) =>
        shape.map((pair) => [
            Math.round(pair[0] * roundFactor) / roundFactor,
            Math.round(pair[1] * roundFactor) / roundFactor,
        ]),
    );

    const mp: MultiPolygon = union([], ...roundedShapes.map((lc) => [[lc]]));
    return mp.flat(1).map((poly) => poly.slice(1));
};

export const joinShapes = (shapes: Shape[]): Pair[] => {
    const polys: Polygon[] = [];
    for (const shape of shapes) {
        polys.push([[...shapeCorners([0, 0], shape).map(toPair)]]);
    }
    const m = union(...(polys as [Polygon]));
    if (m.length === 0) return [];
    if (m.length > 1) throw "TODO split";
    if (m[0].length > 1) throw "TODO split";
    return m[0][0].slice(1);
};
