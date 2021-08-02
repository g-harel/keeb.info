import {Angle, Blank, Cartesian, Pair, UUID} from "./base";

// Keymap applied to a layout.
export interface LayoutKeymap {
    // Reference to target layout.
    layout: UUID;

    // Layer definitions mapping key refs to keycodes.
    layers: Record<UUID, KeymapKeycode>[];

    // Selected layout options for the keymap.
    optionSelection: UUID[];
}

export interface KeymapKeycode {
    keycode: any; // TODO
}

// Implementation of a layout on a board
// TODO rotary encoders.
// TODO split matrix.
export interface LayoutImplementation {
    // Reference to target layout.
    layout: UUID;

    // Mapping of key ref to matrix coordinates.
    matrix: Record<UUID, MatrixLocation>;

    // Selection available layout options.
    availableOptions: UUID[];
}

// Matrix coordinates.
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
    position: Pair;

    // Angle of the footprint (rotated around 0,0).
    // +180deg for inverted switches.
    angle: Angle;

    // Orientation of the switch in the footprint.
    orientation: Cartesian; // TODO implement in footprint.
}
