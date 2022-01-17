import {Point} from "../internal/point";

// TODO inline when only used once.

export const DEBUG_DISABLE_SVG_REF = false;

export const BACKGROUND_COLOR = "#ffffff";
export const DEFAULT_KEY_COLOR = "#eeeeee";
export const START_SECTION_COLOR = "#e2a8a8";
export const START_FOOTPRINT_COLOR = "#e2a8a8";
export const STROKE_COLOR_DARKEN = 0.06;
export const SHELF_COLOR_DIFF = 0.05;
export const BORDER = 0.02;
export const DETAIL_BORDER = BORDER / 2;
export const KEY_PAD = BORDER / 2;
export const KEY_RADIUS = 0.01;
export const SHELF_RADIUS = 0.05;
export const STEP_RATIO = 0.5;
export const STEP_RADIUS =
    Math.min(KEY_RADIUS, SHELF_RADIUS) +
    Math.abs(KEY_RADIUS - SHELF_RADIUS) * STEP_RATIO;
export const ROUND_RESOLUTION = 1 / 5;
export const SHELF_PADDING_TOP = -0.1;
export const SHELF_PADDING_SIDE = 0.12;
export const SHELF_PADDING_BOTTOM = 2 * SHELF_PADDING_SIDE - SHELF_PADDING_TOP; // Keep top square.
export const STEM_WIDTH = 0.03;
export const STEM_SIZE = 0.05;
export const STEM_COLOR_DARKEN = 0;
export const WIRE_WIDTH = STEM_WIDTH;
export const WIRE_COLOR_DARKEN = STEM_COLOR_DARKEN;
export const WIRE_OFFSET = 2 * (STEM_SIZE + WIRE_WIDTH / 2);
export const WIRE_ANGLE = 105;
export const FOOTPRINT_COLOR_DARKEN = 0.3;
export const MIN_KEYSET_WIDTH_DISPLAY = 10;
export const ROTATION_ORIGIN: Point = [0, 0];

export const LEGEND_FONT_SIZE = 0.28;
export const ARC_OFFSET = 1 - Math.sin(Math.PI / 4);
