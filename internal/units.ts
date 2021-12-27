// TODO led support.
// TODO non-english.
// TODO keycode/row preference.

// TODO move types to internal files.

// Angle in degrees clockwise from the horizontal line (0deg = o--->).
export type Angle = number;

// Private unique identifier.
export type UUID = string;

// HEX color in #AARRGGBB format.
export type HexColor = string;

// URL to an image.
export type URL = string;

// X/Y pair not necessarily centered on canvas origin.
export type Pair = [number, number];

// Rounded corner using a quadratic bezier.
export type QuadSegment = [Pair, Pair, Pair];

// Angle with limited possible values in degrees clockwise from the horizontal.
// TODO validation required.
export type RightAngle = 0 | 90 | 180 | 270;

// Unique identifier for product SKU.
export interface ID {
    vendorID: string;
    productID: string;
}
