import {useTheme as styledComponentsUseTheme} from "styled-components";

import {createAccessorsByExample} from "../internal/theme";

export const lightTheme = {
    fontStack: `"Helvetica Neue", Helvetica, Arial, sans-serif`,
    colors: {
        background: "#eeebe2",
        text: "#080909",
        error: "#c87e74",
        main: "#080909",
        sub: "#99947f",
    },
};

export const theme = createAccessorsByExample(lightTheme);
export const useTheme = (): typeof lightTheme =>
    styledComponentsUseTheme() as any;
