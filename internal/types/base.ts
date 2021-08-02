// TODO led support.
// TODO key profiles.
// TODO non-english.
// TODO keycode/row preference.
// TODO novelties/blanks.

// Unit measurement, scaled for 1.0 = 1u.
export type Unit = number;

// Angle in degrees clockwise from the horizontal line (0deg = o--->).
export type Angle = number;

// Private unique identifier.
export type UUID = string;

// Unique identifier for product SKU.
export interface ID {
    vendorID: string;
    productID: string;
}

// X/Y pair not necessarily centered on canvas origin.
export type Pair = [number, number];

// First bool inidcates vertical/horizontal and second is direction on that axis.
// Up:    1,0  -90deg
// Down:  1,1   90deg
// Left:  0,0    0deg
// Right: 0,1  180deg
export type Cartesian = [boolean, boolean];

// Shared layout footprint and keycap attributes.
export interface Blank {
    // Shape of the key.
    shape: Shape[];

    // Relative stem location.
    stem: Pair;

    // Stabilizer mounting location(s).
    stabilizers: Stabilizer[];
}

// Generic rectangular shape.
export interface Shape {
    // Width of shape.
    width: Unit;

    // Height of shape.
    height: Unit;

    // Relative location for composite shapes.
    // ISO enter can be represented using two offset rects.
    offset: Pair;
}

// Wire stabilizer mounting locations.
export interface Stabilizer {
    // Relative location of first stem.
    offset: Pair;

    // Distance between stabilizer stems.
    length: Unit;

    // Angle from first stem to second.
    // +180deg for inverted (wire on top).
    // TODO conver to cartesian.
    angle: Angle;
}
