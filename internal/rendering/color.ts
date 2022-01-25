import color from "color";
import {HexColor} from "../color";

export const STROKE_COLOR_DARKEN = 0.07;
export const STROKE_COLOR_DESATURATE = 0.18;
export const SHELF_COLOR_LIGHTEN = 0.05;

export const keyColor = (base: HexColor): [HexColor, HexColor] => {
    const shelfColor = color(base).lighten(SHELF_COLOR_LIGHTEN).hex();
    const strokeColor = color(base)
        .desaturate(STROKE_COLOR_DESATURATE)
        .darken(STROKE_COLOR_DARKEN)
        .hex();
    return [shelfColor, strokeColor];
};