import React from "react";
import styled, {css} from "styled-components";
import {Serial} from "@ijprest/kle-serial";

import {VIADefinitionV2} from "./.../reader/src/types";
import layout from "../../files/kle/bear65.json";
import {render} from "../../internal/svg";

const config: VIADefinitionV2 = {} as any;
console.log(config);

export interface IProps {}

const Wrapper = styled.div<IProps>`
    border: 1px solid red;
`;

export const Board: React.FunctionComponent<IProps> = (props) => (
    <Wrapper
        dangerouslySetInnerHTML={{__html: render(Serial.deserialize(layout))}}
    />
);
