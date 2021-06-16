// TODO led support.
// TODO key profiles.
// TODO legend->keycode mapping (incl non-english).
// TODO novelties/blanks.
// TODO keycode/row preference.

// Unit measurement, scaled for 1.0 = 1u.
export type Unit = number;

// Angle in degrees clockwise from the horizontal line (0deg = o--->).
export type Angle = number;

// Unique identifier for product SKU.
export interface ID {
    vendorID: string;
    productID: string;
}

// Coordinates are not necessarily centered on canvas origin.
export interface Coord {
    // Horizontal offset.
    // Point moves right as value increases.
    x: Unit;

    // Vertical offset.
    // Point moves down as value increases.
    y: Unit;
}

// Shared layout footprint and keycap attributes.
export interface Blank {
    // Shape of the key.
    shape: Shape[];

    // Relative stem location.
    stem: Coord;

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
    offset: Coord;
}

// Wire stabilizer mounting locations.
export interface Stabilizer {
    // Relative location of first stem.
    offset: Coord;

    // Distance between stabilizer stems.
    length: Unit;

    // Angle from first stem to second.
    // +180deg for inverted (wire on top).
    angle: Angle;
}
