import React from "react";
import styled from "styled-components";

import {Blank} from "../../internal/types/base";

const PAD = 0.025;

export interface IProps {
    blank: Blank;
}

const Shape = styled.div`
    position: relative;
    border-radius: ${1.5*PAD}em;
    background-color: #c2ae8f;
`;

const Wrapper = styled.div`
    :hover {
        ${Shape} {
            background-color: #9e8c65;
        }
    }
`;

const ShapeWrapper = styled.div`
    position: relative;
    width: 0;
    height: 0;
`;

export const Key: React.FunctionComponent<IProps> = ({blank}) => {
    return (
        <Wrapper>
            {blank.shape.map((shape, j) => (
                <ShapeWrapper key={j}>
                    <Shape
                        style={{
                            left: shape.offset.x + PAD + "em",
                            top: shape.offset.y + PAD + "em",
                            width: shape.width - 2 * PAD + "em",
                            height: shape.height - 2 * PAD + "em",
                        }}
                    />
                </ShapeWrapper>
            ))}
        </Wrapper>
    );
};
