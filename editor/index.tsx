import React from "react";
import ReactDOM from "react-dom";
import {createGlobalStyle} from "styled-components";

import {BACKGROUND_COLOR} from "./cons";
import {Demo} from "./demo";
import {Header} from "./header";

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html, body {
        background-color: ${BACKGROUND_COLOR};
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0;
    }

    #root {
        display: flex;
        flex-direction: column;
    }
`;

const App = () => (
    <>
        <GlobalStyle />
        <Header />
        <Demo />
    </>
);

ReactDOM.render(<App />, document.getElementById("root"));
