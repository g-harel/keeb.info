import {ROTATION_ORIGIN} from "../editor/cons";
import {Blank} from "./blank";
import {Box, corners} from "./box";
import {rotateCoord} from "./point";
import {Angle, Point, RightAngle} from "./point";
import { UUID } from "./identity";

// Keyboard layout.
export interface Layout {
    // Unique identifier to refer to the layout.
    ref: UUID;

    // Blockers that do not overlap and are not part of a section.
    fixedBlockers: LayoutBlocker[];

    // Keys that do not overlap and not part of a section.
    fixedKeys: LayoutKey[];

    // Sections of layout where multiple options can be used.
    variableKeys: LayoutSection[];
}

export interface LayoutSection {
    // Unique identifier to refer to the section.
    ref: UUID;

    // Options available for the section.
    // All options should overlap exactly.
    options: LayoutOption[];
}

// Key placement options for an overlapping section of the layout.
export interface LayoutOption {
    // Unique identifier to refer to the option.
    ref: UUID;

    // Blocker positions when layout option is selected.
    blockers: LayoutBlocker[];

    // Key positions when layout option is selected.
    keys: LayoutKey[];
}

// Blocker for for non-key elements like encoders and screens.
// TODO rename (blocker has a meaning already)
export interface LayoutBlocker {
    // Unique identifier to refer to the blocker.
    ref: UUID;

    // Hint to indicate the purpose of the blocker.
    label: string;

    // Shape of the blocker.
    boxes: Box[];

    // Position of the blocker in the layout.
    position: Point;

    // Angle of rotation of the blocker.
    angle: Angle;
}

// Location in the layout where a key can be populated.
// TODO add option for a graphic.
export interface LayoutKey {
    // Unique identifier to refer to key.
    ref: UUID;

    // Physical attributes of the key footprint.
    key: Blank;

    // Position of the key on the layout.
    position: Point;

    // Angle of the footprint (rotated around 0,0).
    // +180deg for inverted switches.
    angle: Angle;

    // Orientation of the switch in the footprint.
    orientation: RightAngle;
}

export const minmax = (layout: Layout): [Point, Point] => {
    const keys: LayoutKey[] = layout.fixedKeys.slice();
    for (const section of layout.variableKeys) {
        for (const option of section.options) {
            keys.push(...option.keys);
        }
    }
    const coords: Point[] = [];
    for (const key of keys) {
        for (const box of key.key.boxes) {
            coords.push(
                ...corners(key.position, box).map((corner) =>
                    rotateCoord(corner, ROTATION_ORIGIN, key.angle),
                ),
            );
        }
    }

    let min: Point = [Infinity, Infinity];
    let max: Point = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};
