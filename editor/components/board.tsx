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

const ShapeWrapper = styled.g``;

const KEY_COLOR = "#cccccc";
const KEY_BORDER_COLOR = "#676767";
const KEY_SHINE_COLOR = "#ebebeb";
const KEY_SHINE_BORDER_COLOR = "#bebebe";
const PAD = 0.00;
const BORDER = 0.02;
const KEY_RADIUS = 0.1;
const SHINE_PADDING_TOP = 0.05;
const SHINE_PADDING_SIDE = 0.12;
const SHINE_PADDING_BOTTOM = 0.2;

export const Shape: React.FunctionComponent<Blank> = (props) => {
    return (
        <ShapeWrapper>
            {props.shape.map((shape, j) => (
                <StrokeRect
                    key={j}
                    fill={KEY_BORDER_COLOR}
                    x={shape.offset.x + PAD}
                    y={shape.offset.y + PAD}
                    rx={KEY_RADIUS}
                    width={shape.width - 2 * PAD}
                    height={shape.height - 2 * PAD}
                />
            ))}
            {props.shape.map((shape, j) => (
                <FillRect
                    key={j}
                    fill={KEY_COLOR}
                    x={shape.offset.x + PAD + BORDER}
                    y={shape.offset.y + PAD + BORDER}
                    rx={KEY_RADIUS}
                    width={shape.width - 2 * (PAD + BORDER)}
                    height={shape.height - 2 * (PAD + BORDER)}
                />
            ))}
            {props.shape.map((shape, j) => (
                <StrokeRect
                    key={j}
                    fill={KEY_SHINE_BORDER_COLOR}
                    x={shape.offset.x + PAD + SHINE_PADDING_SIDE}
                    y={shape.offset.y + PAD + SHINE_PADDING_TOP}
                    rx={KEY_RADIUS}
                    width={shape.width - 2 * (PAD + SHINE_PADDING_SIDE)}
                    height={shape.height - 2 * PAD - SHINE_PADDING_TOP - SHINE_PADDING_BOTTOM}
                />
            ))}
            {props.shape.map((shape, j) => (
                <FillRect
                    key={j}
                    fill={KEY_SHINE_COLOR}
                    x={shape.offset.x + PAD + BORDER + SHINE_PADDING_SIDE}
                    y={shape.offset.y + PAD + BORDER + SHINE_PADDING_TOP}
                    rx={KEY_RADIUS}
                    width={shape.width - 2 * (PAD + BORDER + SHINE_PADDING_SIDE)}
                    height={shape.height - 2 * (PAD + BORDER) - SHINE_PADDING_TOP - SHINE_PADDING_BOTTOM}
                />
            ))}
        </ShapeWrapper>
    );
};

export const Board: React.FunctionComponent<IProps> = ({layout, width}) => {
    const [min, max] = minmax(layout);
    const unitWidth = max.x - min.x;
    const unitHeight = max.y - min.y;

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
