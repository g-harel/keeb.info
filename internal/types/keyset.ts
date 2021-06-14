import {Blank, Coord, ID} from "./base";

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
    legend: string;

    // Physical attributes of the keycap.
    key: Blank;

    // Position in the example layout.
    position: Coord;
}