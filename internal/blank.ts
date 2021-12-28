import {Pair} from "polygon-clipping";

import {Box} from "./box";
import {RightAngle} from "./primitives";

// Shared layout footprint and keycap attributes.
export interface Blank {
    // Shape of the key.
    // ISO enter can be represented using two offset rects.
    boxes: Box[];

    // Relative stem location.
    stem: Pair;

    // Stabilizer mounting location(s).
    stabilizers: Stabilizer[];
}

// Wire stabilizer mounting locations.
export interface Stabilizer {
    // Relative location of first stem.
    offset: Pair;

    // Distance between stabilizer stems.
    length: number;

    // Angle from first stem to second.
    // +180deg for inverted (wire on top).
    angle: RightAngle;
}
