import React from "react";
import styled from "styled-components";

import {minmax} from "../../internal/layout";
import {Coord} from "../../internal/types/base";
import {Layout} from "../../internal/types/layout";
import {Key} from "./key";

// TODO props.
const targetWidth = 800;

export interface IProps {
    layout: Layout;
}

const Wrapper = styled.div<IProps>`
    padding: 10px;

    /* 1u */
    font-size: 2rem;
`;

const KeyTransform = styled.div`
    position: relative;
    width: 0;
    height: 0;
`;

export const Board: React.FunctionComponent<IProps> = ({layout}) => {
    const [min, max] = minmax(layout);

    const width = max.x - min.x;
    const height = max.y - min.y;
    const unit = targetWidth / width;

    return (
        <Wrapper
            style={{
                width: width + "em",
                height: height + "em",
                fontSize: unit + "px",
            }}
        >
            {layout.fixedKeys.map((fixedKey, i) => {
                const origin: Coord = {
                    x: -fixedKey.position.x + min.x,
                    y: -fixedKey.position.y + min.y,
                };
                return (
                    <KeyTransform
                        key={i}
                        style={{
                            left: fixedKey.position.x - min.x + "em",
                            top: fixedKey.position.y - min.y + "em",
                            transform: `rotate(${fixedKey.angle}deg)`,
                            transformOrigin: `${origin.x}em ${origin.y}em`,
                        }}
                    >
                        <Key blank={fixedKey.key} />
                    </KeyTransform>
                );
            })}
        </Wrapper>
    );
};
