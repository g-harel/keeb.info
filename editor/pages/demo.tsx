import React, {Profiler} from "react";
import styled from "styled-components";

import {Keyset} from "../../internal/keyset";
import {convertKLEToLayout} from "../../internal/kle";
import {Layout} from "../../internal/layout";
import {ExplodedLayout} from "../components/views/exploded-layout";
import {FootprintLayout} from "../components/views/footprint-layout";
import {FullKeyset} from "../components/views/full-keyset";
import botanicalKeyset from "../testdata/botanical-keyset.json";
import demoKeyset from "../testdata/demo-keyset.json";
import demoLayout from "../testdata/demo-layout.json";
import kleKeyset from "../testdata/kle-keyset.json";
import kleLayout from "../testdata/kle-layout.json";

const LegacyTestContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 1200;
`;

const profilerLogger = (id, _, duration) => console.log(id, duration);

export const Demo = () => (
    <div>
        <Profiler id="demo-keyset" onRender={profilerLogger}>
            <FullKeyset keyset={demoKeyset as Keyset} width={1200} />
        </Profiler>
        <Profiler id="botanical-keyset" onRender={profilerLogger}>
            <FullKeyset keyset={botanicalKeyset as Keyset} width={1200} />
        </Profiler>
        <Profiler id="demo-layout-exploded" onRender={profilerLogger}>
            <ExplodedLayout layout={demoLayout as Layout} width={1200} />
        </Profiler>
        <Profiler id="demo-layout-footprint" onRender={profilerLogger}>
            <FootprintLayout layout={demoLayout as Layout} width={1200} />
        </Profiler>
        {/* <LegacyTestContainer>
            <ExplodedLayout
                layout={convertKLEToLayout(kleLayout)}
                width={600}
            />
            <ExplodedLayout
                layout={convertKLEToLayout(kleKeyset)}
                width={600}
            />
        </LegacyTestContainer> */}
    </div>
);
