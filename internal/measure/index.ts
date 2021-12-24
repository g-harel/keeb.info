import {intersection, MultiPolygon, union} from "polygon-clipping";
import * as c from "../../editor/cons";

import {
    KeysetKit,
    Pair,
    Shape,
    Angle,
    Cartesian,
    QuadPoint,
} from "../types/base";
import {Layout, LayoutKey, LayoutBlocker} from "../types/base";
import {angleBetween, distance, rotateCoord, splitLine} from "./math";

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

// TODO remove this type.
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

// Corners in ring order.
export const shapeCorners = (offset: Pair, shape: Shape): Pair[] => {
    const x = shape.offset[0] + offset[0];
    const y = shape.offset[1] + offset[1];
    const width = shape.width;
    const height = shape.height;
    return [
        [x, y],
        [x, y + height],
        [x + width, y + height],
        [x + width, y],
    ];
};

export const minmaxKeysetKit = (kit: KeysetKit): [Pair, Pair] => {
    const coords: Pair[] = [];
    for (const key of kit.keys) {
        for (const shape of key.key.shape) {
            coords.push(...shapeCorners(key.position, shape));
        }
    }

    let min: Pair = [Infinity, Infinity];
    let max: Pair = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};

export const minmaxLayout = (layout: Layout): [Pair, Pair] => {
    const keys: LayoutKey[] = layout.fixedKeys.slice();
    for (const section of layout.variableKeys) {
        for (const option of section.options) {
            keys.push(...option.keys);
        }
    }
    const coords: Pair[] = [];
    for (const key of keys) {
        for (const shape of key.key.shape) {
            coords.push(
                ...shapeCorners(key.position, shape).map((corner) =>
                    rotateCoord(corner, c.ROTATION_ORIGIN, key.angle),
                ),
            );
        }
    }

    let min: Pair = [Infinity, Infinity];
    let max: Pair = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};

const deepCopy = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};

const doesIntersect = (a: Pair[][], b: Pair[][]): boolean => {
    const intersections = intersection(a, b);
    return !!intersections.flat(2).length;
};

const offsetKey = (key: LayoutKey, offset: Pair): LayoutKey => {
    const oKey: LayoutKey = deepCopy(key);
    oKey.position[0] += offset[0];
    oKey.position[1] += offset[1];
    return oKey;
};

const padShape = (shape: Shape, pad: number): Shape => {
    return {
        width: shape.width + 2 * pad,
        height: shape.height + 2 * pad,
        offset: [shape.offset[0] - pad, shape.offset[1] - pad],
    };
};

const computeRings = (
    shapes: Shape[],
    position: Pair,
    angle: Angle,
    pad = 0,
): Pair[][] => {
    return shapes.map((shape) =>
        shapeCorners(position, padShape(shape, pad)).map((corner) =>
            rotateCoord(corner, c.ROTATION_ORIGIN, angle),
        ),
    );
};

const ringsFromKey =
    (pad = 0) =>
    (key: LayoutKey): Pair[][] => {
        return computeRings(key.key.shape, key.position, key.angle, pad);
    };

const ringsFromBlocker =
    (pad = 0) =>
    (blocker: LayoutBlocker): Pair[][] => {
        return computeRings(
            blocker.shape,
            blocker.position,
            blocker.angle,
            pad,
        );
    };

// TODO validate section overlap.
// TODO make this faster.
export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = deepCopy(layout);

    const allRings: Pair[][] = [];
    allRings.push(
        ...out.fixedKeys.map(ringsFromKey(c.LAYOUT_OPTIONS_PADDING)).flat(1),
    );
    allRings.push(
        ...out.fixedBlockers
            .map(ringsFromBlocker(c.LAYOUT_OPTIONS_PADDING))
            .flat(1),
    );
    for (const options of layout.variableKeys) {
        allRings.push(
            ...options.options[0].keys
                .map(ringsFromKey(c.LAYOUT_OPTIONS_PADDING))
                .flat(1),
        );
        allRings.push(
            ...options.options[0].blockers
                .map(ringsFromBlocker(c.LAYOUT_OPTIONS_PADDING))
                .flat(1),
        );
    }
    let avoid: Pair[][] = multiUnion(...allRings);

    for (const section of out.variableKeys) {
        // Keep track of how far last option had to be moved and start there.
        let lastIncrement = 1;
        for (const option of section.options.slice(1)) {
            // Move option until it doesn't intersect.
            // TODO include blockers
            for (
                let j = lastIncrement;
                j <= c.LAYOUT_SPREAD_ATTEMPTS;
                j += c.LAYOUT_SPREAD_INCREMENT
            ) {
                if (j === c.LAYOUT_SPREAD_ATTEMPTS) {
                    console.error("TODO spread failed");
                    continue;
                }
                let found = false;
                for (const offset of [
                    [0, j],
                    [0, -j],
                ] as Pair[]) {
                    let intersects = false;
                    for (const key of option.keys) {
                        if (
                            doesIntersect(
                                avoid,
                                ringsFromKey()(offsetKey(key, offset)),
                            )
                        ) {
                            intersects = true;
                            break;
                        }
                    }
                    if (!intersects) {
                        found = true;
                        lastIncrement = j;
                        for (const key of option.keys) {
                            key.position = offsetKey(key, offset).position;
                        }
                        // TODO offset blocker
                        avoid = multiUnion(
                            ...avoid,
                            ...option.keys.map(ringsFromKey()).flat(1),
                            ...option.blockers.map(ringsFromBlocker()).flat(1),
                        );
                        console.log(avoid, option.ref);
                        break;
                    }
                }
                if (found) break;
            }
        }
    }

    return out;
};

export const genID = (
    namespace: string,
    info: {
        base?: Shape[];
        shelf?: Shape[];
        color?: string;
        position?: Pair;
        angle?: number;
    },
): string => {
    let components: any[] = [namespace];
    components = components.concat(
        [...(info.base || []), ...(info.shelf || [])]
            .map((shape) => [shape.height, shape.width, shape.offset])
            .flat(Infinity),
    );
    components = components.concat((info.color ? [info.color] : []) as any);
    components = components.concat(info.position ? [info.position] : []);
    components = components.concat(info.angle ? [info.angle] : []);
    return components.join("/").toUpperCase();
};

export type Orderable<T> = {
    [k in keyof T]: T[k];
} & {
    key: {
        position: Pair;
        angle?: Angle;
    };
};

interface AngledOrderable<T> {
    position: Pair;
    original: Orderable<T>;
}

export const orderKeys = <T>(...items: Orderable<T>[][]): Orderable<T>[] => {
    const angled: AngledOrderable<T>[] = items.flat(1).map((item) => {
        if (!item.key.angle) {
            return {position: item.key.position, original: item};
        }
        return {
            position: rotateCoord(
                item.key.position,
                c.ROTATION_ORIGIN,
                item.key.angle,
            ),
            original: item,
        };
    });
    return angled
        .sort((a, b) => a.position[1] - b.position[1])
        .map((a) => a.original);
};
