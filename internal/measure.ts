import {Polygon, MultiPolygon, union, intersection} from "polygon-clipping";
import {LAYOUT_OPTIONS_PADDING, LAYOUT_SPREAD_INCREMENT} from "../editor/cons";

import {KeysetKit, Pair, Shape} from "./types/base";
import {Layout, LayoutKey} from "./types/base";

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

export const toPair = (c: Pair): Pair => {
    return [c[0], c[1]];
};

const unionKeys = (poly: MultiPolygon, ...keys: LayoutKey[]): MultiPolygon => {
    const polys: Polygon[] = [];
    for (const key of keys) {
        for (const shape of key.key.shape) {
            polys.push([[...shapeCorners(key.position, shape).map(toPair)]]);
        }
    }
    return union(poly, ...polys);
};

const deepCopy = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};

const keyIntersects = (poly: MultiPolygon, key: LayoutKey): boolean => {
    const intersections = intersection(poly, unionKeys([], key));
    return !!intersections.flat(2).length;
};

const offsetKey = (key: LayoutKey, offset: Pair): LayoutKey => {
    const oKey: LayoutKey = deepCopy(key);
    oKey.position[0] += offset[0];
    oKey.position[1] += offset[1];
    return oKey;
};

export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = deepCopy(layout);

    const avoidKeys: LayoutKey[] = out.fixedKeys;
    for (const options of layout.variableKeys) {
        avoidKeys.push(...options.options[0].keys);
    }

    // Add padding around unmodified layout.
    const paddedAvoidKeys = deepCopy(avoidKeys).map((key) => {
        key.key.shape = key.key.shape.map((shape) => {
            shape.width += 2 * LAYOUT_OPTIONS_PADDING;
            shape.height += 2 * LAYOUT_OPTIONS_PADDING;
            shape.offset[0] -= LAYOUT_OPTIONS_PADDING;
            shape.offset[1] -= LAYOUT_OPTIONS_PADDING;
            return shape;
        });
        return key;
    });
    let avoid = unionKeys([], ...paddedAvoidKeys);

    for (const section of out.variableKeys) {
        // Keep track of how far last option had to be moved and start there.
        let lastIncrement = 1;
        for (const option of section.options.slice(1)) {
            // Move option until it doesn't intersect.
            for (let j = lastIncrement; j < 100; j += LAYOUT_SPREAD_INCREMENT) {
                let found = false;
                for (const offset of [
                    [0, j],
                    [0, -j],
                ] as Pair[]) {
                    let intersects = false;
                    for (const key of option.keys) {
                        if (keyIntersects(avoid, offsetKey(key, offset))) {
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
                        avoid = unionKeys(avoid, ...option.keys);
                        break;
                    }
                }
                if (found) break;
            }
        }
    }

    return out;
};
