export interface Coord {
    x: number;
    y: number;
}

export interface Shape {
    width: number;
    height: number;
    offset: Coord;
}

export interface Stabilizer {
    offset: Coord;
    length: number;
    angle: number; // +180 for inverted (cable on top).
}

export interface Blank {
    shape: Shape[];
    stem: Coord;
    stabilizers: Stabilizer[];
}

export interface KeysetKey {
    legend: string;
    // TODO profile.
    key: Blank;
    position: Coord;
}

export interface KeysetKit {
    name: string;
    keys: KeysetKey[];
}

export interface Keyset {
    kits: KeysetKit[];
}

export interface LayoutKey {
    key: Blank;
    position: Coord;
    angle: number; // +180 for inverted switches.
    stabilizers: Stabilizer[];
}

export interface LayoutOption {
    name: string;
    keys: LayoutKey[][];
}

export interface Layout {
    fixedKeys: LayoutKey[];
    options: LayoutOption[];
}
