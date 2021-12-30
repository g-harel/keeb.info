import {Blank} from "./blank";
import {Box, corners} from "./box";
import {HexColor} from "./color";
import { Point } from "./point";
import { ID, URL, UUID } from "./identity";

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
    // TODO add ref.

    // Profile of the keycap.
    profile: KeysetKeycapProfile;

    // Physical attributes of the keycap.
    key: Blank;

    // Elevated portion of the keycap.
    shelf: Box[];

    // Position in the example layout.
    position: Point;

    // Whether the keycap has a homing bar.
    barred: boolean;

    // Whether the keycap has a homing scoop.
    scooped: boolean;

    // Base color of the keycap.
    color?: HexColor;

    // Stem type.
    stem: UUID;

    // Descending order of affinity to certain keycodes.
    keycodeAffinity: any[]; // TODO

    // Printed legends on the cap.
    legend: KeysetKeycapLegends;
}

// Row x Column layout where elements are positionned using space-between semantics.
// ex. top-left: [["x"]]
//     centered: [[], ["", "x", ""], []]
export type SpaceBetweenLayout<T> = T[][];

// Individual character/glyph/label.
export interface KeysetKeycapLegend {
    // Color of the entire legend item.
    color?: HexColor;

    // String to be displayed.
    text: string;

    // Size multiplier relative to letter legends.
    size?: number;
}

// Content printed/added to the keycap.
export interface KeysetKeycapLegends {
    // Legends on the top of the keycap.
    topLegends: SpaceBetweenLayout<KeysetKeycapLegend>;

    // Legends on the front of the keycap (facing the typist).
    frontLegends: SpaceBetweenLayout<KeysetKeycapLegend>;

    // Whether the keycap's top has a relegendable cover.
    relegendable?: boolean;

    // Artwork is centered on the top of the key.
    // Scaled to fit both dimensions and cropped.
    // Rendered under legends.
    artwork?: URL;
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

export const minmax = (kit: KeysetKit): [Point, Point] => {
    const coords: Point[] = [];
    for (const key of kit.keys) {
        for (const box of key.key.boxes) {
            coords.push(...corners(key.position, box));
        }
    }

    let min: Point = [Infinity, Infinity];
    let max: Point = [0, 0];

    for (const c of coords) {
        max = [Math.max(max[0], c[0]), Math.max(max[1], c[1])];
        min = [Math.min(min[0], c[0]), Math.min(min[1], c[1])];
    }

    return [min, max];
};
