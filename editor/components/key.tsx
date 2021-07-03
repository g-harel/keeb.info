import React from "react";
import styled from "styled-components";

import {Blank} from "../../internal/types/base";
import {theme} from "../theme";

const PAD = 0.025;
const BORDER = 0.05;

export interface IProps {
    blank: Blank;
    onClick: () => void;
    selected: boolean;
}

const Shape = styled.div`
    background-color: ${theme.colors.component};
    border-radius: ${1.5 * PAD}em;
    border: ${BORDER}em solid ${theme.colors.foreground};
    box-sizing: border-box;
    position: relative;
`;

const Wrapper = styled.div`
    :hover,
    &.selected {
        ${Shape} {
            background-color: ${theme.colors.foreground};
        }
    }
`;

const ShapeWrapper = styled.div`
    position: relative;
    width: 0;
    height: 0;
`;

export const Key: React.FunctionComponent<IProps> = ({
    blank,
    onClick,
    selected,
}) => {
    return (
        <Wrapper onClick={onClick} className={selected ? "selected" : ""}>
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
            {blank.shape.map((shape, j) => (
                <ShapeWrapper key={blank.shape.length + j}>
                    <Shape
                        style={{
                            left: shape.offset.x + PAD + BORDER + "em",
                            top: shape.offset.y + PAD + BORDER + "em",
                            width: shape.width - 2 * (PAD + BORDER) + "em",
                            height: shape.height - 2 * (PAD + BORDER) + "em",
                            border: "none",
                        }}
                    />
                </ShapeWrapper>
            ))}
        </Wrapper>
    );
};
