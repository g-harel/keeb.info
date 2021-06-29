import React from "react";
import styled from "styled-components";

import {Blank} from "../../internal/types/base";

export interface IProps {
    blank: Blank;
}

const Shape = styled.div`
    position: relative;
    border: 1px solid blue;
`;

const Wrapper = styled.div`
    :hover {
        ${Shape} {
            background-color: red;
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
                            left: shape.offset.x + "em",
                            top: shape.offset.y + "em",
                            width: shape.width + "em",
                            height: shape.height + "em",
                        }}
                    />
                </ShapeWrapper>
            ))}
        </Wrapper>
    );
};
