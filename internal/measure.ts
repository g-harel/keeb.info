import {intersection} from "polygon-clipping";
import * as c from "../editor/cons";
import {multiUnion} from "./geometry";

import {KeysetKit, Pair, Shape, Angle} from "./types/base";
import {Layout, LayoutKey, LayoutBlocker} from "./types/base";

// Position is P and the rotation origin is R.
export const rotateCoord = (p: Pair, r: Pair, a: number): Pair => {
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
                ...shapeCorners(key.position, shape).map((c) =>
                    rotateCoord(c, [0, 0], key.angle),
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
            rotateCoord(corner, [0, 0], angle),
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
