export interface Coord {
    x: number;
    y: number;
}

export interface Shape {
    width: number;
    height: number;
    offset: Coord;
}

export interface Blank {
    shape: Shape[];
    stem: Coord;
    // TODO stab stems
}

export interface KeysetKey {
    legend: string;
    key: Blank;
    position: Coord;
}

export interface Keyset {
    keys: KeysetKey[];
}

export interface LayoutKey {
    key: Blank;
    position: Coord;
    angle: number; // +180 for inverted switches.
}

export interface Layout {
    keys: LayoutKey[];
}
