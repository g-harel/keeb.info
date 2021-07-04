import {Angle, Blank, Coord} from "./base";

// Keyboard layout.
export interface Layout {
    // Keys that do not overlap and not part of an option.
    fixedKeys: LayoutKey[];

    // Layout options for this layout.
    options: LayoutOption[];
}

// Key placement options for an overlapping section of the layout.
export interface LayoutOption {
    // Public-facing option name.
    name: string;

    // All options should overlap exactly.
    options: LayoutKey[][];
}

// Location in the layout where a key can be populated.
export interface LayoutKey {
    // Physical attributes of the key footprint.
    key: Blank;

    // Position of the key on the layout.
    position: Coord;

    // Angle of the footprint (rotated around 0,0).
    // +180deg for inverted switches.
    angle: Angle;

    // Matrix position of the footprint.
    matrixRow: number;
    matrixColumn: number;
}
