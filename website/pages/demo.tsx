import React, {Profiler} from "react";
import styled from "styled-components";

import titan from "../../external/the-via/keyboards/v3/acekeyboard/titan60/titan60.json";
import discipline from "../../external/the-via/keyboards/v3/cftkb/discipline/discipline.json";
import bear from "../../external/the-via/keyboards/v3/other/bear_65/bear_65.json";
import candybar from "../../external/the-via/keyboards/v3/tkc/candybar/candybar-lefty.json";

import {Keyset} from "../../internal/keyset";
import {convertKLEToLayout} from "../../internal/kle";
import {Layout} from "../../internal/layout";
import {convertViaToLayout} from "../../internal/via";
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

const Wrapper = styled.div`
    * {
        border: 1px solid #eee;
        margin: 1rem;
    }
`;

const profilerLogger = (id, _, duration) => console.log(id, duration);

export const Demo = () => (
    <Wrapper>
        <Profiler id="via-titan-layout-exploded" onRender={profilerLogger}>
            <ExplodedLayout layout={convertViaToLayout(titan)} width={600} />
        </Profiler>
        <Profiler id="via-discipline-layout-exploded" onRender={profilerLogger}>
            <ExplodedLayout
                layout={convertViaToLayout(discipline)}
                width={600}
            />
        </Profiler>
        <Profiler id="via-candybar-layout-exploded" onRender={profilerLogger}>
            <ExplodedLayout layout={convertViaToLayout(candybar)} width={600} />
        </Profiler>
        <Profiler id="via-bear-layout-exploded" onRender={profilerLogger}>
            <ExplodedLayout layout={convertViaToLayout(bear)} width={600} />
        </Profiler>
        <Profiler id="demo-keyset" onRender={profilerLogger}>
            <FullKeyset keyset={demoKeyset as Keyset} width={1200} />
        </Profiler>
        <Profiler id="botanical-keyset" onRender={profilerLogger}>
            <FullKeyset
                keyset={botanicalKeyset as any as Keyset}
                width={1200}
            />
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
    </Wrapper>
);
