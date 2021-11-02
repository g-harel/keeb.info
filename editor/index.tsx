import React, {Fragment, Profiler} from "react";
import ReactDOM from "react-dom";
import styled, {createGlobalStyle} from "styled-components";

import {ExplodedLayout} from "./components/views/exploded-layout";
import kleLayout from "./testing/kle-layout.json";
import kleKeyset from "./testing/kle-keyset.json";
import demoLayout from "./testing/demo-layout.json";
import botanicalKeyset from "./testing/botanical-keyset.json";
import demoKeyset from "./testing/demo-keyset.json";
import {convertKLEToKeysetKit, convertKLEToLayout} from "../internal/convert";
import {BACKGROUND_COLOR} from "./cons";
import {FootprintLayout} from "./components/views/footprint-layout";
import {Keyset, Layout} from "../internal/types/base";
import {FullKeyset} from "./components/views/full-keyset";

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

const profilerLogger = (id, _, duration) => console.log(id, duration);

const App = () => (
    <Fragment>
        <GlobalStyle />
        <Profiler id="demo-keyset" onRender={profilerLogger}>
            <FullKeyset keyset={demoKeyset as Keyset} width={1200} />
        </Profiler>
        <Profiler id="botanical-keyset" onRender={profilerLogger}>
            <FullKeyset keyset={botanicalKeyset as Keyset} width={2400} />
        </Profiler>
        <Profiler id="demo-layout-exploded" onRender={profilerLogger}>
            <ExplodedLayout layout={demoLayout as Layout} width={1200} />
        </Profiler>
        <Profiler id="demo-layout-footprint" onRender={profilerLogger}>
            <FootprintLayout layout={demoLayout as Layout} width={1200} />
        </Profiler>
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
