// TODO led support.
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
// Up:    true,false   -90deg
// Down:  true,true     90deg
// Left:  false,false    0deg
// Right: false,true   180deg
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
    angle: Cartesian;
}

// Group of keycap kits with matching theme.
export interface Keyset {
    // Unique identifier.
    id: ID;

    // Public-facing keyset name.
    name: string;

    // Kits part of the keyset.
    kits: KeysetKit[];
}

// Collection of keycaps available as a unit.
export interface KeysetKit {
    // Unique identifier.
    id: ID;

    // Public-facing kit name.
    name: string;

    // Keys included in the kit.
    keys: KeysetKeycap[];
}

// Individual keycap placed on an example layout.
export interface KeysetKeycap {
    // Printed legend.
    legend: KeysetKeycapLegend;

    // Profile of the keycap.
    profile: KeysetKeycapProfile;

    // Physical attributes of the keycap.
    key: Blank;

    // Elevated portion of the keycap.
    shelf: Shape[];

    // Position in the example layout.
    position: Pair;

    // Whether the keycap has a homing bar.
    barred: boolean;

    // Whether the keycap has a homing scoop.
    scooped: boolean;

    // Base color of the keycap.
    color?: string;

    // Stem type.
    stem: UUID;
}

// TODO relegendable.
// TODO color.
// TODO novelties.
// TODO materials?
export interface KeysetKeycapLegend {
    topLegends: string[][];
    frontLegends: string[][];
    keycodeAffinity: any[]; // TODO
}

export interface KeysetKeycapProfile {
    profile: UUID;
    row: string;
}

// Keycap profile definition.
export interface Profile {
    // Unique identifier to refer to the profile.
    ref: UUID;

    // Human-readable name.
    name: string;

    // Possible row values, ordered from top to bottom.
    rows: string[];

    // Spacebar value.
    spacebar: string[];
}

export interface Stem {
    // Unique identifier to refer to the stem type.
    ref: UUID;

    // Human-readable name.
    name: string;
}

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
// TODO screens.
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
    orientation: Cartesian;
}
