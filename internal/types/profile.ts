import {Angle, Blank, Coord, UUID} from "./base";

// Keycap profile definition.
export interface Profile {
    // Unique identifier to refer to the profile.
    ref: UUID;

    // Possible row values, ordered from top to bottom.
    rows: string[];

    // Spacebar value.
    spacebar: string[];
}
