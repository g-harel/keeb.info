import React from "react";
import ReactDOM from "react-dom";
import {createGlobalStyle} from "styled-components";
import {BrowserRouter, useRoutes} from "react-router-dom";

import {BACKGROUND_COLOR} from "./cons";
import {Header} from "./components/header";
import {sitemap} from "./sitemap";

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html {
        background-color: ${BACKGROUND_COLOR};
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0;
        height: 100%;
    }

    body {
        display: flex;
        margin: 0;
        min-height: 100%;

        // Dots background.
        background-color: #f4ffdf;
        background-image: radial-gradient(#ffe2e8 0.95px, transparent 0.95px), radial-gradient(#ffe2e8 0.95px, #fff3f5 0.95px);
        background-size: 18px 18px;
        background-position: 0 0, 9px 9px;
    }

    #root {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding-bottom: 5rem;
    }
`;

const Routes = () => {
    return useRoutes(Object.values(sitemap));
};

const App = () => (
    <>
        <GlobalStyle />
        <BrowserRouter>
            <Header />
            <Routes />
        </BrowserRouter>
    </>
);

ReactDOM.render(<App />, document.getElementById("root"));
