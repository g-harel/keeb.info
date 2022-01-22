import {useTheme as styledComponentsUseTheme} from "styled-components";

import {createAccessorsByExample} from "../internal/theme";

// TODO rename to lightTheme
export const rawTheme = {
    colors: {
        primary: "#111111",
        highlight: "pink",
        highlightAccent: "lightpink",
        secondary: "magenta",
        background: "#fffffa",
    },
};

export const theme = createAccessorsByExample(rawTheme);
export const useTheme = (): typeof rawTheme =>
    styledComponentsUseTheme() as any;
