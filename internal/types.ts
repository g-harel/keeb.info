export interface Keyset {
    kits: KeysetKit[];
}

export interface Layout {
    fixedKeys: LayoutKey[];
    options: LayoutOption[];
}

//

export interface LayoutOption {
    name: string;
    options: LayoutKey[][]; // All options should overlap exactly.
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