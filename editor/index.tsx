import React, {Fragment} from "react";
import ReactDOM from "react-dom";
import styled, {createGlobalStyle} from "styled-components";

import {ExplodedLayout} from "./components/views/exploded-layout";
import kleLayout from "./testing/kle-layout.json";
import kleKeyset from "./testing/kle-keyset.json";
import testLayout from "./testing/layout.json";
import testKeyset from "./testing/keyset.json";
import {convertKLEToKeysetKit, convertKLEToLayout} from "../internal/convert";
import {BACKGROUND_COLOR} from "./cons";
import {FootprintLayout} from "./components/views/footprint-layout";
import {Keyset, Layout} from "../internal/types/base";
import {FullKeyset} from "./components/views/full-keyset";
import {Demo} from "./testing/demo";

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

const LegacyTestContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 1200;
`;

const App = () => (
    <Fragment>
        <GlobalStyle />
        <Demo />
        <FullKeyset keyset={testKeyset as Keyset} width={2400} />
        <ExplodedLayout layout={testLayout as Layout} width={1200} />
        <FootprintLayout layout={testLayout as Layout} width={1200} />
        <LegacyTestContainer>
            <ExplodedLayout
                layout={convertKLEToLayout(kleLayout)}
                width={600}
            />
            <ExplodedLayout
                layout={convertKLEToLayout(kleKeyset)}
                width={600}
            />
        </LegacyTestContainer>
    </Fragment>
);

ReactDOM.render(<App />, document.getElementById("root"));
