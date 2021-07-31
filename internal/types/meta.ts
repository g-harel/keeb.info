import {UUID} from "./base";

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