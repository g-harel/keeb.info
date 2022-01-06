import {Line, splitLine} from "./point";
import {Point} from "./point";
import {Shape} from "./shape";

// Rounded corner using a quadratic bezier.
export type Curve = [Point, Point, Point];

// Rounded shape comprised of multiple quadratic bezier curves.
// Start and end of each in-order segment should overlap.
export type CurveShape = Curve[];

export const splitQuadCurve = (point: Curve, percentage: number): Point => {
    const [p0, p1, p2] = point;
    return splitLine(
        percentage,
        splitLine(percentage, p0, p1),
        splitLine(percentage, p1, p2),
    );
};

export const approx = (rounded: CurveShape, resolution: number): Shape => {
    const points: Shape = [];
    for (const point of rounded) {
        for (let p = 0; p <= 1; p += resolution) {
            points.push(splitQuadCurve(point, p));
        }
    }
    return points;
};

// Calculate "count" lines spanning between the "a" and "b" arcs.
export const bridgeArcs = (count: number, a: Curve, b: Curve) => {
    const lines: Line[] = [];
    for (let i = 0; i <= count; i++) {
        const percentage = i / count;
        lines.push([
            splitQuadCurve(a, percentage),
            splitQuadCurve(b, percentage),
        ]);
    }
    return lines;
};

export const toSVGPath = (shape: CurveShape): string => {
    let path = "";
    for (let i = 0; i < shape.length; i++) {
        const [rStart, point, rEnd] = shape[i];
        path += `${i === 0 ? "M" : "L"} ${rStart[0]} ${rStart[1]} `;
        path += `Q ${point[0]} ${point[1]} ${rEnd[0]} ${rEnd[1]} `;
    }
    path += "Z";
    return path;
};
