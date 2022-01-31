import {useTheme as styledComponentsUseTheme} from "styled-components";

import {createAccessorsByExample} from "../internal/theme";

export const lightTheme = {
    fontStack: `'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier', 'monospace';`,
    colors: {
        background: "#fefefe",
        text: "#080909",
        error: "#c87e74",
        main: "#080909",
        sub: "#69646f",
    },
};

export const theme = createAccessorsByExample(lightTheme);
export const useTheme = (): typeof lightTheme =>
    styledComponentsUseTheme() as any;
