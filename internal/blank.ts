import {Box} from "./box";
import {Point, RightAngle} from "./point";

// Shared layout footprint and keycap attributes.
export interface Blank {
    // Shape of the key.
    // ISO enter can be represented using two offset rects.
    boxes: Box[];

    // Relative stem location.
    stem: Point;

    // Stabilizer mounting location(s).
    stabilizers: Stabilizer[];
}

// Wire stabilizer mounting locations.
export interface Stabilizer {
    // Relative location of first stem.
    offset: Point;

    // Distance between stabilizer stems.
    length: number;

    // Angle from first stem to second.
    // +180deg for inverted (wire on top).
    angle: RightAngle;
}
