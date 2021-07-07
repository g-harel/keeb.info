import React, {useState} from "react";
import styled from "styled-components";

import {minmax} from "../../internal/layout";
import {Blank} from "../../internal/types/base";
import {Layout} from "../../internal/types/layout";

export interface IProps {
    width: number;
    layout: Layout;
}

const Group = styled.g`
    :hover {
        rect {
            fill: blue;
        }
    }
`;

const FillRect = styled.rect``;

const StrokeRect = styled.rect``;

const ShapeWrapper = styled.g`
    ${FillRect} {
        fill: red;
    }

    ${StrokeRect} {
        fill: black;
    }
`;

const PAD = 0.03;
const BORDER = 0.02;

export const Shape: React.FunctionComponent<Blank> = (props) => (
    <ShapeWrapper>
        {props.shape.map((shape, j) => (
            <StrokeRect
                key={j}
                x={shape.offset.x + PAD}
                y={shape.offset.y + PAD}
                rx="0.02"
                width={shape.width - 2 * PAD}
                height={shape.height - 2 * PAD}
            />
        ))}
        {props.shape.map((shape, j) => (
            <FillRect
                key={j}
                x={shape.offset.x + PAD + BORDER}
                y={shape.offset.y + PAD + BORDER}
                rx="0.02"
                width={shape.width - 2 * (PAD + BORDER)}
                height={shape.height - 2 * (PAD + BORDER)}
            />
        ))}
    </ShapeWrapper>
);

export const Board: React.FunctionComponent<IProps> = ({layout, width}) => {
    const [min, max] = minmax(layout);
    const unitWidth = max.x - min.x;
    const unitHeight = max.y - min.y;
    const unit = width / unitWidth;

    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const toggleSelected = (id: number) => () => {
        setSelected(Object.assign({}, selected, {[id]: !selected[id]}));
    };

    return (
        <svg
            xmlnls="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${unitWidth} ${unitHeight}`}
            width={width}
        >
            {layout.fixedKeys.map((fixedKey, i) => (
                <Group
                    key={i}
                    style={{
                        transform: `rotate(${fixedKey.angle}deg) translate(${
                            fixedKey.position.x - min.x
                        }px,${fixedKey.position.y - min.y}px)`,
                        transformOrigin: `${-min.x}px ${-min.y}px`,
                    }}
                >
                    <Shape {...fixedKey.key} key={i} />
                </Group>
            ))}
        </svg>
    );
};
