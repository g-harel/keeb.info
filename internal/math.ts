import {Angle, Point} from "./primitives";

export const distance = (a: Point, b: Point): number => {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};

export const angleBetween = (a: Point, b: Point, center: Point): number => {
    const dAx = center[0] - a[0];
    const dAy = center[1] - a[1];
    const dBx = b[0] - center[0];
    const dBy = b[1] - center[1];
    return Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
};

export const split = (percentage: number, a: number, b: number): number => {
    return a + percentage * (b - a);
};

export const splitLine = (percentage: number, a: Point, b: Point): Point => {
    return [split(percentage, a[0], b[0]), split(percentage, a[1], b[1])];
};

// Position is P and the rotation origin is R.
export const rotateCoord = (p: Point, r: Point, a: number): Point => {
    const angleRads = a * (Math.PI / 180);
    const rotatedX =
        Math.cos(angleRads) * (p[0] - r[0]) -
        Math.sin(angleRads) * (p[1] - r[1]) +
        r[0];
    const rotatedY =
        Math.sin(angleRads) * (p[0] - r[0]) +
        Math.cos(angleRads) * (p[1] - r[1]) +
        r[1];
    return [rotatedX, rotatedY];
};

interface AngledPosition<T> {
    position: Point;
    original: T;
}

export const orderVertically = <T>(
    getter: (item: T) => [Point, Angle?],
    origin: Point,
    ...items: T[][]
) => {
    const angled: AngledPosition<T>[] = items.flat(1).map((item) => {
        const [position, angle] = getter(item);
        if (!angle) {
            return {position: position, original: item};
        }
        return {
            position: rotateCoord(position, origin, angle),
            original: item,
        };
    });
    return angled
        .sort((a, b) => a.position[1] - b.position[1])
        .map((a) => a.original);
};
