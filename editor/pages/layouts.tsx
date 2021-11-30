import React from "react";
import styled from "styled-components";

import {convertKLEToLayoutKeymap} from "../../internal/convert";
import {Layout} from "../../internal/types/base";
import {LayoutKeymap} from "../components/views/layout-keymap";

import alix40 from "../../files/kle/alix40.json";
import bear65 from "../../files/kle/bear65.json";
import candybar from "../../files/kle/candybar.json";
import corne from "../../files/kle/corne.json";
import cornelius from "../../files/kle/cornelius.json";
import creator from "../../files/kle/creator.json";
import discipline65 from "../../files/kle/discipline65.json";
import epoch80 from "../../files/kle/epoch80.json";
import fc980c from "../../files/kle/fc980c.json";
import hhkb from "../../files/kle/hhkb.json";
import id80 from "../../files/kle/id80.json";
import miryoku from "../../files/kle/miryoku.json";
import nyquist from "../../files/kle/nyquist.json";
import saturn60 from "../../files/kle/saturn60.json";
import tkc1800 from "../../files/kle/tkc1800.json";
import tkl from "../../files/kle/tkl.json";

// TODO better styling.
const StyledItem = styled.div`
    margin: 2rem 0;
`;

// TODO make downloadable.
export const LayoutItem = (props: {raw: any}) => {
    const [layout, keymap] = convertKLEToLayoutKeymap(props.raw);
    const name = props.raw[0]?.name || "unknown";
    return (
        <StyledItem>
            <h2>{name}</h2>
            <h4>{layout.fixedKeys.length} keys</h4>
            <LayoutKeymap
                layout={layout as Layout}
                keymap={keymap}
                width={838}
            />
        </StyledItem>
    );
};

// TODO serve bundle to web.
export const Layouts = () => (
    <div>
        <LayoutItem raw={alix40} />
        <LayoutItem raw={bear65} />
        <LayoutItem raw={candybar} />
        <LayoutItem raw={corne} />
        <LayoutItem raw={cornelius} />
        <LayoutItem raw={creator} />
        <LayoutItem raw={discipline65} />
        <LayoutItem raw={epoch80} />
        <LayoutItem raw={fc980c} />
        <LayoutItem raw={hhkb} />
        <LayoutItem raw={id80} />
        <LayoutItem raw={miryoku} />
        <LayoutItem raw={nyquist} />
        <LayoutItem raw={saturn60} />
        <LayoutItem raw={tkc1800} />
        <LayoutItem raw={tkl} />
    </div>
);
