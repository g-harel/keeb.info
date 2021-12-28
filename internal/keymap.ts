import {KeysetKeycapLegends} from "./keyset";
import {HexColor, UUID} from "./units";

// Keymap applied to a layout.
export interface LayoutKeymap {
    // Reference to target layout.
    layout: UUID;

    // Layer definitions mapping key refs to keycodes.
    layers: Record<UUID, KeymapKey>[];

    // Selected layout options for the keymap.
    optionSelection: UUID[];
}

export interface KeymapKeycode {
    // TODO
}

export interface KeymapKey {
    tapKeycode: KeymapKeycode;
    holdKeycode: KeymapKeycode;

    // TEMP
    legends: KeysetKeycapLegends;
    color: HexColor;
}

// Implementation of a layout on a board
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
