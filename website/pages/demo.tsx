import Color from "color";
import React, {Profiler} from "react";
import styled from "styled-components";

import tkc1800 from "../../external/the-via/keyboards/src/tkc/tkc1800/tkc1800.json";
import titan from "../../external/the-via/keyboards/v3/acekeyboard/titan60/titan60.json";
import polaris from "../../external/the-via/keyboards/v3/ai03/polaris/polaris.json";
import discipline from "../../external/the-via/keyboards/v3/cftkb/discipline/discipline.json";
import epoch from "../../external/the-via/keyboards/v3/epoch80/epoch80.json";
import bear from "../../external/the-via/keyboards/v3/other/bear_65/bear_65.json";
import candybar from "../../external/the-via/keyboards/v3/tkc/candybar/candybar-lefty.json";

import {colorSeries} from "../../internal/color";
import {Keyset} from "../../internal/keyset";
import {convertKLEToLayout} from "../../internal/kle";
import {Layout} from "../../internal/layout";
import {ReactProps} from "../../internal/react";
import {ExplodedLayout} from "../../internal/rendering/views/exploded-layout";
import {FootprintLayout} from "../../internal/rendering/views/footprint-layout";
import {FullKeyset} from "../../internal/rendering/views/full-keyset";
import {convertViaToLayout} from "../../internal/via";
import {Defer} from "../components/defer";
import botanicalKeyset from "../testdata/botanical-keyset.json";
import demoKeyset from "../testdata/demo-keyset.json";
import demoLayout from "../testdata/demo-layout.json";
import kleKeyset from "../testdata/kle-keyset.json";
import kleLayout from "../testdata/kle-layout.json";

interface DemoItemProps extends ReactProps {
    name: string;
}

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

const DemoItem = (props: DemoItemProps) => {
    const profilerLogger = (id, _, duration) => console.log(id, duration);
    return (
        <Defer>
            <Profiler id={props.name} onRender={profilerLogger}>
                {props.children}
            </Profiler>
        </Defer>
    );
};

export const Demo = () => (
    <Wrapper>
        <DemoItem name="via-titan-layout-exploded">
            <ExplodedLayout layout={convertViaToLayout(titan)} width={600} />
        </DemoItem>
        <DemoItem name="via-polaris-layout-exploded">
            <ExplodedLayout layout={convertViaToLayout(polaris)} width={600} />
        </DemoItem>
        <DemoItem name="via-discipline-layout-exploded">
            <ExplodedLayout
                layout={convertViaToLayout(discipline)}
                width={600}
            />
        </DemoItem>
        <DemoItem name="via-epoch-layout-exploded">
            <ExplodedLayout layout={convertViaToLayout(epoch)} width={600} />
        </DemoItem>
        <DemoItem name="via-candybar-layout-exploded">
            <ExplodedLayout layout={convertViaToLayout(candybar)} width={600} />
        </DemoItem>
        <DemoItem name="via-bear-layout-exploded">
            <ExplodedLayout layout={convertViaToLayout(bear)} width={600} />
        </DemoItem>
        <DemoItem name="via-tkc1800-layout-exploded">
            <ExplodedLayout layout={convertViaToLayout(tkc1800)} width={1200} />
        </DemoItem>
        <DemoItem name="demo-layout-exploded">
            <ExplodedLayout layout={demoLayout as Layout} width={1200} />
        </DemoItem>
        <DemoItem name="botanical-keyset">
            <FullKeyset
                keyset={botanicalKeyset as any as Keyset}
                width={1200}
            />
        </DemoItem>
        <DemoItem name="demo-layout-footprint">
            <FootprintLayout layout={demoLayout as Layout} width={1200} />
        </DemoItem>
        <LegacyTestContainer>
            <DemoItem name="rainbow-keyset">
                <FullKeyset keyset={rainbowTable(21)} width={600} />
            </DemoItem>
            <DemoItem name="demo-keyset">
                <FullKeyset keyset={demoKeyset as Keyset} width={1200} />
            </DemoItem>
            <DemoItem name="demo-kle-layout">
                <ExplodedLayout
                    layout={convertKLEToLayout(kleLayout)}
                    width={600}
                />
            </DemoItem>
            <DemoItem name="demo-kle-keyset">
                <ExplodedLayout
                    layout={convertKLEToLayout(kleKeyset)}
                    width={600}
                />
            </DemoItem>
        </LegacyTestContainer>
    </Wrapper>
);

// TODO also cycle through saturation
const rainbowTable = (count: number): Keyset => {
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
    const colors = colorSeries("red", count);
    colors.push("#808080");
    for (let i = 0; i <= count; i++) {
        for (let j = 0; j <= count; j++) {
            const baseColor = Color(colors[i]);
            const progress = j / count;
            let keyColor: string = "";
            if (progress < 0.5) {
                keyColor = baseColor.lighten(1 - 2 * progress).hex();
            } else {
                keyColor = baseColor.darken(2 * (progress - 0.5)).hex();
            }
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
                color: keyColor,
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
