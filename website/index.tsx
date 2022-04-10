import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, useRoutes} from "react-router-dom";
import {ThemeProvider, createGlobalStyle} from "styled-components";

import {clear} from "../internal/debug";
import {isErr} from "../internal/possible";
import {Header} from "./components/header";
import "./search";
import {loadSearchData} from "./search";
import {sitemap} from "./sitemap";
import {lightTheme, theme} from "./theme";

// TODO TEMP
(async () => {
    console.log("Loading data.");
    const idx = await loadSearchData();
    if (isErr(idx)) {
        console.warn(idx.err.print());
        return;
    }

    // console.log(idx.search("a")); // TODO
})();
// TODO TEMP

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html {
        background-color: ${theme.colors.background};
        color: ${theme.colors.text};
        font-family: ${theme.fontStack};
        margin: 0;
        height: 100%;
    }

    body {
        background-color: ${theme.colors.background};
        display: flex;
        flex-direction: column;
        margin: 0;
        min-height: 100%;
    }

    #root {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding-bottom: 5rem;
    }
`;

const Routes = () => {
    clear();
    return useRoutes(Object.values(sitemap));
};

const App = () => (
    <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <BrowserRouter>
            <Header />
            <Routes />
        </BrowserRouter>
    </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById("root"));
