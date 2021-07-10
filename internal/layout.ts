import {Coord} from "./types/base";
import {Layout, LayoutKey} from "./types/layout";

// Key's position is P and the rotation origin 0,0.
export const rotateCoord = (p: Coord, a: number): Coord => {
    if (a === 0) return p;
    const distance = Math.sqrt(p.x ** 2 + p.y ** 2);
    const angle = Math.acos(p.x / distance);
    const finalAngle = angle + a * (Math.PI / 180);
    const xOffsetRtoP = distance * Math.cos(finalAngle);
    const yOffsetRtoP = distance * Math.sin(finalAngle);
    return {x: xOffsetRtoP, y: yOffsetRtoP};
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

export const minmax = (layout: Layout): [Coord, Coord] => {
    let min: Coord = {x: Infinity, y: Infinity};
    let max: Coord = {x: 0, y: 0};

    const keys: LayoutKey[] = [];
    keys.push(...layout.fixedKeys);
    for (const section of layout.variableKeys) {
        for (const option of section.options) {
            keys.push(...option.keys);
        }
    }

    for (const k of keys) {
        const rotated: Coord[] = corners(k).map((c) => {
            return rotateCoord(c, k.angle);
        });

        max = {
            x: Math.max(max.x, ...rotated.map((c) => c.x)),
            y: Math.max(max.y, ...rotated.map((c) => c.y)),
        };
        min = {
            x: Math.min(min.x, ...rotated.map((c) => c.x)),
            y: Math.min(min.y, ...rotated.map((c) => c.y)),
        };
    }

    return [min, max];
};
