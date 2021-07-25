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

export const corners = (key: LayoutKey): Coord[] => {
    const coords: Coord[] = [];
    for (const shape of key.key.shape) {
        const x = shape.offset.x + key.position.x;
        const y = shape.offset.y + key.position.y;
        const width = shape.width;
        const height = shape.height;
        coords.push({x: x, y: y});
        coords.push({x: x, y: y + height});
        coords.push({x: x + width, y: y + height});
        coords.push({x: x + width, y: y});
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

const pointInKey = (key: LayoutKey, point: Coord): boolean => {
    const rotatedPoint = rotateCoord(point, {x: 0, y: 0}, -key.angle);
    for (const shape of key.key.shape) {
        const left = rotatedPoint.x > key.position.x + shape.offset.x;
        const right =
            rotatedPoint.x < key.position.x + shape.offset.x + shape.width;
        const top = rotatedPoint.y > key.position.y + shape.offset.y;

        // Bottom edge treated differently because option keys are only shifted down.
        // Distance from bottom edge to point.
        const bottomDiff =
            rotatedPoint.y - (key.position.y + shape.offset.y + shape.height);

        if (left && right && top && bottomDiff >= -1) {
            return true;
        }
    }
    return false;
};

export const minmax = (layout: Layout): [Coord, Coord] => {
    return minmaxFromCoord(allCoords(layout));
};

export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = JSON.parse(JSON.stringify(layout));
    const avoidCoords = allCoords(layout);

    for (const section of out.variableKeys) {
        for (let i = 0; i < section.options.length; i++) {
            const option = section.options[i];

            // Leave the first option in place.
            if (i === 0) {
                avoidCoords.push(...coordsFromKeys(option.keys));
                continue;
            }

            // Move option until it doesn't intersect.
            let offset = 0;
            for (let j = 1; j < 100; j += 0.01) {
                let intersects = false;
                for (const key of option.keys) {
                    const offsetKey: LayoutKey = JSON.parse(
                        JSON.stringify(key),
                    );
                    offsetKey.position.y += j;

                    for (const coord of avoidCoords) {
                        if (pointInKey(offsetKey, coord)) {
                            intersects = true;
                            break;
                        }
                    }
                    if (intersects) break;
                }
                if (!intersects) {
                    offset = j;
                    break;
                }
            }

            for (const key of option.keys) {
                key.position.y += offset;
            }
            avoidCoords.push(...coordsFromKeys(option.keys));
            // TODO all directions
            // TODO push new coords
        }
    }

    return out;
};
