import React from "react";
import styled from "styled-components";

import alix40 from "../../external/g-harel/keyboards/kle/alix40.json";
import bear65 from "../../external/g-harel/keyboards/kle/bear65.json";
import candybar from "../../external/g-harel/keyboards/kle/candybar.json";
import corne from "../../external/g-harel/keyboards/kle/corne.json";
import cornelius from "../../external/g-harel/keyboards/kle/cornelius.json";
import creator from "../../external/g-harel/keyboards/kle/creator.json";
import discipline65 from "../../external/g-harel/keyboards/kle/discipline65.json";
import epoch80 from "../../external/g-harel/keyboards/kle/epoch80.json";
import fc980c from "../../external/g-harel/keyboards/kle/fc980c.json";
import hatsu from "../../external/g-harel/keyboards/kle/hatsu.json";
import hhkb from "../../external/g-harel/keyboards/kle/hhkb.json";
import id80 from "../../external/g-harel/keyboards/kle/id80.json";
import microdox from "../../external/g-harel/keyboards/kle/microdox.json";
import miryoku from "../../external/g-harel/keyboards/kle/miryoku.json";
import nyquist from "../../external/g-harel/keyboards/kle/nyquist.json";
import saturn60 from "../../external/g-harel/keyboards/kle/saturn60.json";
import tkc1800 from "../../external/g-harel/keyboards/kle/tkc1800.json";
import tkl from "../../external/g-harel/keyboards/kle/tkl.json";

import {convertKLEToLayoutKeymap} from "../../internal/kle";
import {Layout, minmax} from "../../internal/layout";
import {subtract} from "../../internal/point";
import {LayoutKeymap} from "../../internal/rendering/views/layout-keymap";
import {Defer} from "../components/defer";

const StyledWrapper = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem 0;
`;

const StyledItem = styled.div`
    margin-bottom: 1rem;
    padding: 1.5rem 2rem 2rem;

    h2 {
        margin: 0;
        padding-left: 1rem;
    }

    h4 {
        margin: 0 0 1rem;
        padding-left: 1rem;
    }

    svg {
        width: 100%;
        height: auto;
    }
`;

// TODO make downloadable.
export const LayoutItem = (props: {raw: any}) => {
    const [layout, keymap] = convertKLEToLayoutKeymap(props.raw);
    const [width, height] = subtract(...minmax(layout));
    const defaultWidth = 838;

    let stabCount = 0;
    for (const key of layout.fixedKeys) {
        stabCount += key.blank.stabilizers.length;
    }

    const name = props.raw[0]?.name || "unknown";
    return (
        <StyledItem>
            <h2>{name}</h2>
            <h4>{layout.fixedKeys.length} keys, {stabCount} stabs</h4>
            <Defer
                width={`${defaultWidth}px`}
                height={`${(defaultWidth / width) * height}px`}
            >
                <LayoutKeymap
                    layout={layout as Layout}
                    keymap={keymap}
                    width={defaultWidth}
                />
            </Defer>
        </StyledItem>
    );
};

export const Layouts = () => (
    <StyledWrapper>
        <LayoutItem raw={alix40} />
        <LayoutItem raw={bear65} />
        <LayoutItem raw={candybar} />
        <LayoutItem raw={corne} />
        <LayoutItem raw={cornelius} />
        <LayoutItem raw={creator} />
        <LayoutItem raw={discipline65} />
        <LayoutItem raw={epoch80} />
        <LayoutItem raw={fc980c} />
        <LayoutItem raw={hatsu} />
        <LayoutItem raw={hhkb} />
        <LayoutItem raw={id80} />
        <LayoutItem raw={microdox} />
        <LayoutItem raw={miryoku} />
        <LayoutItem raw={nyquist} />
        <LayoutItem raw={saturn60} />
        <LayoutItem raw={tkc1800} />
        <LayoutItem raw={tkl} />
    </StyledWrapper>
);
