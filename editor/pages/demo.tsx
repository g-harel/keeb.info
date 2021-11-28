import React, {Profiler} from "react";
import styled from "styled-components";

import {ExplodedLayout} from "../components/views/exploded-layout";
import kleLayout from "../testing/kle-layout.json";
import kleKeyset from "../testing/kle-keyset.json";
import demoLayout from "../testing/demo-layout.json";
import botanicalKeyset from "../testing/botanical-keyset.json";
import demoKeyset from "../testing/demo-keyset.json";
import {convertKLEToLayout} from "../../internal/convert";
import {FootprintLayout} from "../components/views/footprint-layout";
import {Keyset, Layout} from "../../internal/types/base";
import {FullKeyset} from "../components/views/full-keyset";

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
    </div>
);
