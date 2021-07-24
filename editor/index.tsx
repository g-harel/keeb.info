import React, {Fragment} from "react";
import ReactDOM from "react-dom";
import styled, {createGlobalStyle} from "styled-components";

import {Board} from "./components/board";
import kleLayout from "./testing/kle-layout.json";
import kleKeyset from "./testing/kle-keyset.json";
import testLayout from "./testing/layout.json";
import {convertKLEToLayout} from "../internal/convert";
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

const LegacyTestContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 1200;
`;

const App = () => (
    <Fragment>
        <GlobalStyle />
        <Board layout={testLayout as Layout} width={1200} />
        <LegacyTestContainer>
            <Board layout={convertKLEToLayout(kleLayout)} width={600} />
            <Board layout={convertKLEToLayout(kleKeyset)} width={600} />
        </LegacyTestContainer>
    </Fragment>
);

ReactDOM.render(<App />, document.getElementById("root"));
