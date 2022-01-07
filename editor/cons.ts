import {Point} from "../internal/point";

export const DEBUG = true;

export const BACKGROUND_COLOR = "#ffffff";
export const DEFAULT_KEY_COLOR = "#eeeeee";
export const START_SECTION_COLOR = "#e2a8a8";
export const START_FOOTPRINT_COLOR = "#e2a8a8";
export const STROKE_COLOR_DARKEN = 0.06;
export const SHINE_COLOR_DIFF = 0.05;
export const BORDER = 0.02;
export const DETAIL_BORDER = BORDER / 2;
export const KEY_PAD = BORDER / 2;
export const KEY_RADIUS = 0.01;
export const SHINE_RADIUS = 0.05;
export const STEP_RATIO = 0.5;
export const STEP_RADIUS =
    Math.min(KEY_RADIUS, SHINE_RADIUS) +
    Math.abs(KEY_RADIUS - SHINE_RADIUS) * STEP_RATIO;
export const ROUND_RESOLUTION = 1 / 5;
export const SHINE_PADDING_TOP = -0.1;
export const SHINE_PADDING_SIDE = 0.12;
export const SHINE_PADDING_BOTTOM = 2 * SHINE_PADDING_SIDE - SHINE_PADDING_TOP; // Keep top square.
export const STEM_WIDTH = 0.03;
export const STEM_SIZE = 0.05;
export const STEM_COLOR_DARKEN = 0;
export const WIRE_WIDTH = STEM_WIDTH;
export const WIRE_COLOR_DARKEN = STEM_COLOR_DARKEN;
export const WIRE_OFFSET = 2 * (STEM_SIZE + WIRE_WIDTH / 2);
export const WIRE_ANGLE = 105;
export const LAYOUT_OPTIONS_PADDING = 0.45;
export const LAYOUT_SPREAD_INCREMENT = 0.501;
export const LAYOUT_SPREAD_ATTEMPTS = 50;
export const FOOTPRINT_COLOR_DARKEN = 0.3;
export const MIN_KEYSET_WIDTH_DISPLAY = 10;
export const ROTATION_ORIGIN: Point = [0, 0];

// https://github.com/mohitg11/GH-CAD-Resources/blob/master/MX%20Series.pdf
// https://github.com/mohitg11/GH-CAD-Resources/blob/master/MXSpec.pdf
const CHERRY_UNIT = 0.61; // Unit to convert inch measurements to layout grid.
export const CHERRY_MIDDLE_STEM_RADIUS = 0.157 / CHERRY_UNIT / 2;
export const CHERRY_PIN_RADIUS = 0.067 / CHERRY_UNIT / 2;
export const CHERRY_PIN_OFFSET_X = (4 * 0.05) / CHERRY_UNIT;
export const CHERRY_POLE_RADIUS = 0.059 / CHERRY_UNIT / 2;
export const CHERRY_POLE1_OFFSET_X = (-3 * 0.05) / CHERRY_UNIT;
export const CHERRY_POLE2_OFFSET_X = (2 * 0.05) / CHERRY_UNIT;
export const CHERRY_POLE1_OFFSET_Y = (-2 * 0.05) / CHERRY_UNIT;
export const CHERRY_POLE2_OFFSET_Y = (-4 * 0.05) / CHERRY_UNIT;
export const CHERRY_PLATE_STAB_TOP_OFFSET =
    ((CHERRY_UNIT / 15.6) * 7) / CHERRY_UNIT;
export const CHERRY_PLATE_STAB_BOTTOM_OFFSET =
    ((CHERRY_UNIT / 15.6) * 8.24) / CHERRY_UNIT;
export const CHERRY_PLATE_STAB_TOP_RADIUS =
    ((CHERRY_UNIT / 15.6) * 3.05) / CHERRY_UNIT / 2;
export const CHERRY_PLATE_STAB_BOTTOM_RADIUS =
    ((CHERRY_UNIT / 15.6) * 4) / CHERRY_UNIT / 2;
export const NOT_KEY_FOOTPRINT_SIZE = 2 * CHERRY_MIDDLE_STEM_RADIUS;

export const LEGEND_FONT_SIZE = 0.28;
export const LEGEND_PADDING = 0.08;
export const ARC_OFFSET = 1 - Math.sin(Math.PI / 4);
