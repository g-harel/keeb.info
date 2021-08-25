export const BACKGROUND_COLOR = "#ffffff";
export const DEFAULT_KEY_COLOR = "#eeeeee";
export const START_SECTION_COLOR = "#e2a8a8";
export const START_FOOTPRINT_COLOR = "#e2a8a8";
export const STROKE_COLOR_DARKEN = 0.06;
export const SHINE_COLOR_DIFF = 0.1;
export const BORDER = 0.02;
export const PAD = 0.01;
export const KEY_RADIUS = 0.05;
export const SHINE_RADIUS = 0.1;
export const SHINE_PADDING_TOP = -1.65 * (BORDER + PAD);
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
export const LAYOUT_SPREAD_INCREMENT = 0.5;
export const FOOTPRINT_COLOR_DARKEN = 0.3;
export const MIN_KEYSET_WIDTH_DISPLAY = 10;

// https://github.com/mohitg11/GH-CAD-Resources/blob/master/MX%20Series.pdf
// https://github.com/mohitg11/GH-CAD-Resources/blob/master/MXSpec.pdf
export const CHERRY_MIDDLE_STEM_RADIUS = 0.157 / 0.61 / 2;
export const CHERRY_PIN_RADIUS = 0.067 / 0.61 / 2;
export const CHERRY_PIN_OFFSET_X = (4 * 0.05) / 0.61;
export const CHERRY_POLE_RADIUS = 0.059 / 0.61 / 2;
export const CHERRY_POLE1_OFFSET_X = (-3 * 0.05) / 0.61;
export const CHERRY_POLE2_OFFSET_X = (2 * 0.05) / 0.61;
export const CHERRY_POLE1_OFFSET_Y = (-2 * 0.05) / 0.61;
export const CHERRY_POLE2_OFFSET_Y = (-4 * 0.05) / 0.61;
export const CHERRY_PLATE_STAB_TOP_OFFSET = ((0.61 / 15.6) * 7) / 0.61;
export const CHERRY_PLATE_STAB_BOTTOM_OFFSET = ((0.61 / 15.6) * 8.24) / 0.61;
export const CHERRY_PLATE_STAB_TOP_RADIUS = ((0.61 / 15.6) * 3.05) / 0.61 / 2;
export const CHERRY_PLATE_STAB_BOTTOM_RADIUS = ((0.61 / 15.6) * 4) / 0.61 / 2;
export const NOT_KEY_FOOTPRINT_SIZE = 2 * CHERRY_MIDDLE_STEM_RADIUS;

export const LEGEND_FONT_SIZE = 0.28;
export const LEGEND_PADDING = 0.08;
export const ARC_OFFSET = Math.sqrt(2) - 1.1; // Not sure why 1.1, should be exactly 1.
