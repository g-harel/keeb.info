import React from "react";
import styled, {css} from "styled-components";
import {Serial} from "@ijprest/kle-serial";

import tkl from "../../files/kle/tkl.json";
import {render} from "../../internal/svg";
import {convertKLE} from "../../internal/convert";

export interface IProps {
    // TODO keyboard
}

const Wrapper = styled.div<IProps>`
    border: 1px solid red;
    width: 20em;
    height: 20em;

    /* 1u */
    font-size: 2rem;
`;

const KeyWrapper = styled.div`
    position: relative;
    width: 0;
    height: 0;
`;

const Key = styled.div`
    position: relative;
    border: 1px solid blue;
    width: 1em;
    height: 1em;

    :hover {
        background-color: red;
    }
`;

const u = (value: string | number) => `${value}em`;

export const Board: React.FunctionComponent<IProps> = (props) => {
    const layout = convertKLE(tkl);

    return (
        <Wrapper>
            {layout.fixedKeys.map((key) => (
                <KeyWrapper>
                    <Key
                        style={{
                            left: u(key.position.x),
                            top: u(key.position.y),
                            width: u(key.key.shape[0].width),
                            height: u(key.key.shape[0].height),
                        }}
                    />
                </KeyWrapper>
            ))}
        </Wrapper>
    );
};
