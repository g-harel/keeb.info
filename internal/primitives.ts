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
export type Point = [number, number];

// List of Pairs that form a closed shape.
// Each point appears only once.
export type Shape = Point[];

// Rounded corner using a quadratic bezier.
export type QuadSegment = [Point, Point, Point];

// Rounded shape comprised of multiple quadratic bezier curves.
// Start and end of each in-order segment should overlap.
export type RoundShape = QuadSegment[];

// Angle with limited possible values in degrees clockwise from the horizontal.
// TODO validation required.
export type RightAngle = 0 | 90 | 180 | 270;

// Unique identifier for product SKU.
export interface ID {
    vendorID: string;
    productID: string;
}
