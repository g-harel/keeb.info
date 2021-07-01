import React, {Fragment} from "react";
import ReactDOM from "react-dom";
import {createGlobalStyle} from "styled-components";

import {Board} from "./components/board";

import iso from "../.iso.json";
import bear65 from "../files/kle/bear65.json";
import {convertKLE} from "../internal/convert";
import {theme} from "./theme";

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html, body, #root {
        align-items: center;
        background-color: ${theme.colors.background};
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

const App: React.FunctionComponent = () => (
    <Fragment>
        <GlobalStyle />
        <Board layout={convertKLE(iso)} width={900} />
        <Board layout={convertKLE(bear65)} width={900} />
    </Fragment>
);

ReactDOM.render(<App />, document.getElementById("root"));
