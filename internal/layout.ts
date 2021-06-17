import { Coord } from "./types/base";
import {Layout, LayoutKey} from "./types/layout";

// Key's position is P and the rotation origin 0,0.
const rotateCoord = (p: Coord, a: number): Coord => {
    // TODO simplify.
    const r = {x: 0, y: 0};
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
        coords.push({x: shape.offset.x, y: shape.offset.y});
        coords.push({x: shape.offset.x, y: shape.offset.y + shape.height});
        coords.push({x: shape.offset.x + shape.width, y: shape.offset.y + shape.height});
        coords.push({x: shape.offset.x + shape.width, y: shape.offset.y});
    }
    return coords;
}

export const minmax = (layout: Layout) => {
    let max: Coord = {x: 0, y: 0};
    let min: Coord = {x: Infinity, y: Infinity};

    const keys: LayoutKey[] = [];
    keys.push(...layout.fixedKeys);
    for (const option of layout.options) {
        keys.push(...option.options[0]);
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
}