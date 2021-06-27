import React from "react";
import styled from "styled-components";

import bear65 from "../../.iso.json";
import {convertKLE} from "../../internal/convert";
import {minmax} from "../../internal/layout";
import {Coord} from "../../internal/types/base";

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
            {layout.fixedKeys.map((fixedKey, i) => {
                const origin: Coord = {
                    x: fixedKey.position.x - min.x,
                    y: fixedKey.position.y - min.y,
                };
                return (
                    <KeyWrapper key={i}>
                        {fixedKey.key.shape.map((shape, j) => {
                            const left =
                                fixedKey.position.x + shape.offset.x - min.x;
                            const top =
                                fixedKey.position.y + shape.offset.y - min.y;
                            return (
                                <Key
                                    key={j}
                                    style={{
                                        left: u(left),
                                        top: u(top),
                                        width: u(shape.width),
                                        height: u(shape.height),
                                        transform: `rotate(${fixedKey.angle}deg)`,
                                        transformOrigin: `-${u(origin.x)} -${u(
                                            origin.y,
                                        )}`,
                                    }}
                                />
                            );
                        })}
                    </KeyWrapper>
                );
            })}
        </Wrapper>
    );
};
