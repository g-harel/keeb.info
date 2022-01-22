import React, {Profiler} from "react";
import styled from "styled-components";

import tkc1800 from "../../external/the-via/keyboards/src/tkc/tkc1800/tkc1800.json";
import titan from "../../external/the-via/keyboards/v3/acekeyboard/titan60/titan60.json";
import discipline from "../../external/the-via/keyboards/v3/cftkb/discipline/discipline.json";
import bear from "../../external/the-via/keyboards/v3/other/bear_65/bear_65.json";
import candybar from "../../external/the-via/keyboards/v3/tkc/candybar/candybar-lefty.json";

import {colorSeries} from "../../internal/color";
import {Keyset} from "../../internal/keyset";
import {convertKLEToLayout} from "../../internal/kle";
import {Layout} from "../../internal/layout";
import {ExplodedLayout} from "../../internal/rendering/views/exploded-layout";
import {FootprintLayout} from "../../internal/rendering/views/footprint-layout";
import {FullKeyset} from "../../internal/rendering/views/full-keyset";
import {convertViaToLayout} from "../../internal/via";
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

const rainbowTable = (count: number): Keyset => {
    const colors = colorSeries("red", count);
    const keyset: Keyset = {
        name: "rainbowTable",
        id: {
            productID: "rainbowTable",
            vendorID: "rainbowTable",
        },
        kits: [
            {
                id: {
                    productID: "rainbowTableKit",
                    vendorID: "rainbowTableKit",
                },
                keys: [],
                name: "rainbowTableKit",
            },
        ],
    };
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            keyset.kits[0].keys.push({
                blank: {
                    boxes: [
                        {
                            width: 1,
                            height: 1,
                            offset: [0, 0],
                        },
                    ],
                    stem: [0.5, 0.5],
                    stabilizers: [],
                },
                color: colors[(i + j) % count],
                profile: {
                    profile: "profile",
                    row: "row",
                },
                shelf: [],
                barred: false,
                scooped: false,
                stem: "",
                keycodeAffinity: [],
                legend: {
                    topLegends: [],
                    frontLegends: [],
                },
                position: [i, j],
            });
        }
    }
    return keyset;
};

export const Demo = () => (
    <Wrapper>
        <Profiler id="rainbow-keyset" onRender={profilerLogger}>
            <FullKeyset keyset={rainbowTable(21)} width={600} />
        </Profiler>
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
        <Profiler id="via-bear-layout-exploded" onRender={profilerLogger}>
            <ExplodedLayout layout={convertViaToLayout(tkc1800)} width={1200} />
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
