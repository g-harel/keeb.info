import {Angle, Blank, Coord, UUID} from "./base";

// Keymap applied to a layout.
export interface LayoutKeymap {
    layout: UUID;
    layers: Record<UUID, KeymapKeycode>[];
}

export interface KeymapKeycode {
    keycode: any; // TODO
}

export interface LayoutImplementation {
    layout: UUID;
    matrix: Record<UUID, MatrixLocation>;
}

export interface MatrixLocation {
    row: number;
    column: number;
}

// Keyboard layout.
export interface Layout {
    // Unique identifier to refer to the layout.
    ref: UUID;

    // Keys that do not overlap and not part of an option.
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

    // Key positions when layout is selected.
    keys: LayoutKey[];
}

// Location in the layout where a key can be populated.
export interface LayoutKey {
    // Unique identifier to refer to key.
    ref: UUID;

    // Physical attributes of the key footprint.
    key: Blank;

    // Position of the key on the layout.
    position: Coord;

    // Angle of the footprint (rotated around 0,0).
    // +180deg for inverted switches.
    angle: Angle;
}
