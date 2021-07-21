import React, {Fragment} from "react";
import ReactDOM from "react-dom";
import {createGlobalStyle} from "styled-components";

import {Board} from "./components/board";
import kleLayout from "./testing/kle.json";
import testLayout from "./testing/layout.json";
import {convertKLE} from "../internal/convert";
import {BACKGROUND_COLOR} from "./cons";
import {Layout} from "../internal/types/layout";

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html, body, #root {
        align-items: center;
        background-color: ${BACKGROUND_COLOR};
        justify-content: center;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0;
        min-height: 100%;
        width: 100%;
    }
`;

const App = () => (
    <Fragment>
        <GlobalStyle />
        <Board layout={convertKLE(kleLayout)} width={800} />
        <Board layout={testLayout as Layout} width={1200} />
    </Fragment>
);

ReactDOM.render(<App />, document.getElementById("root"));
