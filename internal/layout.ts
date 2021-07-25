import polygonClipping, {Polygon, Pair, MultiPolygon, union} from "polygon-clipping";

import {Coord, Shape} from "./types/base";
import {Layout, LayoutKey} from "./types/layout";

// Key's position is P and the rotation origin is R.
export const rotateCoord = (p: Coord, r: Coord, a: number): Coord => {
    if (a === 0) return p;
    const distanceRtoP = Math.sqrt((p.x - r.x) ** 2 + (p.y - r.y) ** 2);
    const angleRtoP = Math.acos((p.x - r.x) / distanceRtoP);
    const finalAngle = angleRtoP + a * (Math.PI / 180);
    const xOffsetRtoP = distanceRtoP * Math.cos(finalAngle);
    const yOffsetRtoP = distanceRtoP * Math.sin(finalAngle);
    return {x: r.x + xOffsetRtoP, y: r.y + yOffsetRtoP};
};

// Corners in ring order.
const shapeCorners = (offset: Coord, shape: Shape): Coord[] => {
    const x = shape.offset.x + offset.x;
    const y = shape.offset.y + offset.y;
    const width = shape.width;
    const height = shape.height;
    return [
        {x: x, y: y},
        {x: x, y: y + height},
        {x: x + width, y: y + height},
        {x: x + width, y: y},
    ];
};

export const corners = (key: LayoutKey): Coord[] => {
    const coords: Coord[] = [];
    for (const shape of key.key.shape) {
        coords.push(...shapeCorners(key.position, shape));
    }
    return coords;
};

const coordsFromKeys = (keys: LayoutKey[]): Coord[] => {
    const rotated: Coord[] = [];
    const seen: Record<string, boolean> = {};
    for (const k of keys) {
        const rotatedCorners: Coord[] = corners(k).map((c) => {
            return rotateCoord(c, {x: 0, y: 0}, k.angle);
        });

        // Only keep unique coordinates.
        for (const r of rotatedCorners) {
            const id = `${r.x}/${r.y}`;
            if (seen[id]) continue;
            seen[id] = true;
            rotated.push(r);
        }
    }
    return rotated;
};

// Extract all unique coordinates (corners) from the layout.
// TODO only keep edge points.
const allCoords = (layout: Layout): Coord[] => {
    const keys: LayoutKey[] = [];
    keys.push(...layout.fixedKeys);
    for (const section of layout.variableKeys) {
        for (const option of section.options) {
            keys.push(...option.keys);
        }
    }
    return coordsFromKeys(keys);
};

const minmaxFromCoord = (coords: Coord[]): [Coord, Coord] => {
    let min: Coord = {x: Infinity, y: Infinity};
    let max: Coord = {x: 0, y: 0};

    for (const c of coords) {
        max = {
            x: Math.max(max.x, c.x),
            y: Math.max(max.y, c.y),
        };
        min = {
            x: Math.min(min.x, c.x),
            y: Math.min(min.y, c.y),
        };
    }

    return [min, max];
};

export const minmax = (layout: Layout): [Coord, Coord] => {
    return minmaxFromCoord(allCoords(layout));
};

const toPair = (c: Coord): Pair => {
    return [c.x, c.y];
};

const unionKeys = (poly: MultiPolygon, ...keys: LayoutKey[]): MultiPolygon => {
    const polys: Polygon[] = [];
    for (const key of keys) {
        for (const shape of key.key.shape) {
            polys.push([[...shapeCorners(key.position, shape).map(toPair)]]);
        }
    }
    return polygonClipping.union(poly, ...polys);
}

const keyIntersects = (poly: MultiPolygon, key: LayoutKey): boolean => {
    const intersection = polygonClipping.intersection(poly, unionKeys([], key));
    return !!intersection.flat(2).length;
};

const offsetKey = (key: LayoutKey, offset: Coord): LayoutKey => {
    const oKey: LayoutKey = JSON.parse(JSON.stringify(key));
    oKey.position.x += offset.x;
    oKey.position.y += offset.y;
    return oKey;
};

export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = JSON.parse(JSON.stringify(layout));

    const optionFirsts: LayoutKey[] = [];
    for (const options of layout.variableKeys) {
        optionFirsts.push(...options.options[0].keys);
    }
    let avoid = unionKeys([], ...out.fixedKeys, ...optionFirsts);

    for (const section of out.variableKeys) {
        for (const option of section.options.slice(1)) {
            // Move option until it doesn't intersect.
            for (let j = 1; j < 100; j += 1) {
                let intersects = false;
                for (const key of option.keys) {
                    if (keyIntersects(avoid, offsetKey(key, {x: 0, y: j}))) {
                        intersects = true;
                        break;
                    }
                }
                if (!intersects) {
                    for (const key of option.keys) {
                        key.position.y += j;
                    }
                    avoid = unionKeys(avoid, ...option.keys);
                    break;
                }
            }
        }
    }

    return out;
};
