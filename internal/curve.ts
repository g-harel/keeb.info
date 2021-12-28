import {angleBetween, distance, splitLine} from "./math";
import {Point, QuadSegment, RoundShape, Shape} from "./primitives";

export const round = (
    shape: Shape,
    radius: number,
    concaveRadius: number,
): RoundShape => {
    const points: RoundShape = [];
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

export const splitQuadCurve = (
    point: QuadSegment,
    percentage: number,
): Point => {
    const [p0, p1, p2] = point;
    return splitLine(
        percentage,
        splitLine(percentage, p0, p1),
        splitLine(percentage, p1, p2),
    );
};

export const approx = (rounded: RoundShape, resolution: number): Shape => {
    const points: Shape = [];
    for (const point of rounded) {
        for (let p = 0; p <= 1; p += resolution) {
            points.push(splitQuadCurve(point, p));
        }
    }
    return points;
};

// Calculate "count" lines spanning between the "a" and "b" arcs.
export const bridgeArcs = (count: number, a: QuadSegment, b: QuadSegment) => {
    const lines: [Point, Point][] = [];
    for (let i = 0; i <= count; i++) {
        const percentage = i / count;
        lines.push([
            splitQuadCurve(a, percentage),
            splitQuadCurve(b, percentage),
        ]);
    }
    return lines;
};