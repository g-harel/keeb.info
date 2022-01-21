import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, useRoutes} from "react-router-dom";
import {ThemeProvider, createGlobalStyle} from "styled-components";

import {clear} from "../internal/debug";
import {Header} from "./components/header";
import {sitemap} from "./sitemap";
import {rawTheme, theme} from "./theme";

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html {
        background-color: #ffffff;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
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
    <ThemeProvider theme={rawTheme}>
        <GlobalStyle />
        <BrowserRouter>
            <Header />
            <Routes />
        </BrowserRouter>
    </ThemeProvider>
);

ReactDOM.render(<App />, document.getElementById("root"));
