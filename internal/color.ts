import color from "color";

// HEX color in #AARRGGBB format.
export type HexColor = string;

// TODO validation,
export type GMKColor = keyof typeof gmkColors;

const gmkColors = {
    GR21: "#ebeded", // Botanical white.
    GN21: "#9fb5ab", // Botanical light green.
    GN20: "#4a6056", // Botanical dark green.
    "botanical-beige": "#e6e2da",
};

const _gmkColors: Record<string, string> = gmkColors;
export const resolveColor = (hexOrCode: HexColor | GMKColor): string => {
    if (_gmkColors[hexOrCode] !== undefined) {
        return _gmkColors[hexOrCode];
    }
    return hexOrCode;
};

export const colorSeries = (startColor: string, count: number): string[] => {
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(
            color(startColor)
                .rotate((i / count) * 360)
                .hex(),
        );
    }
    return colors;
};
