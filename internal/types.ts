// Keycap set with matching theme.
export interface Keyset {
    name: string; // TODO vendor/product id.

    // Group of keycaps available as a unit.
    kits: KeysetKit[];
}

// Keyboard layout.
export interface Layout {
    // Keys that do not overlap and not part of an option.
    fixedKeys: LayoutKey[];

    // Layout options for this layout.
    options: LayoutOption[];
}

//

// Key placement options for an overlapping section of the layout.
export interface LayoutOption {
    name: string;

    // All options should overlap exactly.
    options: LayoutKey[][];
}

export interface LayoutKey {
    key: Blank;
    position: Coord;
    angle: Angle; // +180 for inverted switches.
    stabilizers: Stabilizer[];
}

export interface KeysetKey {
    legend: string; // TODO map to keycodes + non-english.
    // TODO profile.
    key: Blank;
    position: Coord;
}

export interface KeysetKit {
    name: string;
    keys: KeysetKey[];
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

// Generic rectangular shape.
export interface Shape {
    // Width of shape.
    width: Unit;

    // Height of shape.
    height: Unit;

    // Local offset for composite shapes.
    // ISO enter can be represented using two offset rects.
    offset: Coord;
}

// Wire stabilizer mounting locations.
export interface Stabilizer {
    //
    offset: Coord;
    length: Unit;
    angle: Angle; // +180 for inverted (wire on top).
}

export interface Blank {
    shape: Shape[];
    stem: Coord;
    stabilizers: Stabilizer[];
}

// Unit measurement, scaled for 1.0 = 1u.
export type Unit = number;

// Angle in degrees clockwise from the horizontal line (0deg = o--->).
export type Angle = number;
