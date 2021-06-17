import React from "react";
import styled from "styled-components";

import bear65 from "../../files/kle/bear65.json";
import {convertKLE} from "../../internal/convert";
import {minmax} from "../../internal/layout";

// TODO props.
const targetWidth = 800;

export interface IProps {
    // TODO keyboard
}

const Wrapper = styled.div<IProps>`
    border: 1px solid red;

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

const u = (value: number) => `${value}em`;
const px = (value: number) => `${value}px`;

export const Board: React.FunctionComponent<IProps> = (props) => {
    const layout = convertKLE(bear65);
    const [min, max] = minmax(layout);

    const width = max.x - min.x;
    const height = max.y - min.y;
    const unit = targetWidth / width;

    return (
        <Wrapper
            style={{
                width: u(width),
                height: u(height),
                fontSize: px(unit),
            }}
        >
            {layout.fixedKeys.map((key, i) => (
                <KeyWrapper key={i}>
                    <Key
                        style={{
                            left: u(key.position.x - min.x),
                            top: u(key.position.y - min.y),
                            width: u(key.key.shape[0].width),
                            height: u(key.key.shape[0].height),
                        }}
                    />
                </KeyWrapper>
            ))}
        </Wrapper>
    );
};
