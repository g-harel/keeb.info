import React, {useState} from "react";
import styled from "styled-components";
import * as color from "color";

import {minmax, rotateCoord} from "../../internal/layout";
import {Blank, Coord} from "../../internal/types/base";
import {Layout} from "../../internal/types/layout";

export interface IProps {
    width: number;
    layout: Layout;
}

const OuterRect = styled.rect``;

const Group = styled.g`
    :hover {
        ${OuterRect} {
            fill: red;
        }
    }
`;

// TODO pass color as arg to blank component.
// TODO make each section different color.
const DEFAULT_KEY_COLOR = "#cccccc";
const STROKE_COLOR_DARKEN = 0.5;
const SHINE_COLOR_DIFF = 0.15;
const PAD = 0.012;
const BORDER = 0.024;
const KEY_RADIUS = 0.075;
const INNER_KEY_RADIUS = KEY_RADIUS * 0.75;
const SHINE_PADDING_TOP = 0.05;
const SHINE_PADDING_SIDE = 0.12;
const SHINE_PADDING_BOTTOM = 0.2;
const STEM_WIDTH = 0.03;
const STEM_SIZE = 0.05;
const STEM_COLOR = "#cccccc";
const WIRE_WIDTH = STEM_WIDTH;
const WIRE_COLOR = STEM_COLOR;
const WIRE_OFFSET = 2 * (STEM_SIZE + WIRE_WIDTH / 2);
const WIRE_ANGLE = 105;

export const Stem: React.FunctionComponent<Coord> = (props) => (
    <>
        <line
            x1={props.x}
            y1={props.y - STEM_SIZE}
            x2={props.x}
            y2={props.y + STEM_SIZE}
            stroke={STEM_COLOR}
            strokeWidth={STEM_WIDTH}
            strokeLinecap="round"
        />
        <line
            x1={props.x - STEM_SIZE}
            y1={props.y}
            x2={props.x + STEM_SIZE}
            y2={props.y}
            stroke={STEM_COLOR}
            strokeWidth={STEM_WIDTH}
            strokeLinecap="round"
        />
    </>
);

export const Mounts: React.FunctionComponent<Blank> = (props) => (
    <>
        <Stem {...props.stem} />
        {props.stabilizers.map((stabilizer) => {
            const startStem = stabilizer.offset;
            const endStem = rotateCoord(
                {
                    x: startStem.x + stabilizer.length,
                    y: startStem.y,
                },
                startStem,
                stabilizer.angle,
            );
            const startWire = rotateCoord(
                {
                    x: startStem.x + WIRE_OFFSET,
                    y: startStem.y,
                },
                startStem,
                stabilizer.angle + WIRE_ANGLE,
            );
            const endWire = rotateCoord(
                {
                    x: endStem.x + WIRE_OFFSET,
                    y: endStem.y,
                },
                endStem,
                stabilizer.angle + 180 - WIRE_ANGLE,
            );
            return (
                <>
                    <Stem {...startStem} />
                    <Stem {...endStem} />
                    <line
                        x1={startWire.x}
                        y1={startWire.y}
                        x2={endWire.x}
                        y2={endWire.y}
                        stroke={WIRE_COLOR}
                        strokeWidth={WIRE_WIDTH}
                        strokeLinecap="round"
                    />
                </>
            );
        })}
    </>
);

export const Shape: React.FunctionComponent<Blank> = (props) => {
    return (
        <>
            {props.shape.map((shape, j) => (
                <OuterRect
                    key={j}
                    fill={color(DEFAULT_KEY_COLOR).darken(STROKE_COLOR_DARKEN)}
                    x={shape.offset.x + PAD}
                    y={shape.offset.y + PAD}
                    rx={KEY_RADIUS}
                    width={shape.width - 2 * PAD}
                    height={shape.height - 2 * PAD}
                />
            ))}
            {props.shape.map((shape, j) => (
                <rect
                    key={j}
                    fill={DEFAULT_KEY_COLOR}
                    x={shape.offset.x + PAD + BORDER}
                    y={shape.offset.y + PAD + BORDER}
                    rx={INNER_KEY_RADIUS}
                    width={shape.width - 2 * (PAD + BORDER)}
                    height={shape.height - 2 * (PAD + BORDER)}
                />
            ))}
            {props.shape.map((shape, j) => (
                <rect
                    key={j}
                    fill={color(DEFAULT_KEY_COLOR).darken(SHINE_COLOR_DIFF)}
                    x={shape.offset.x + PAD + SHINE_PADDING_SIDE}
                    y={shape.offset.y + PAD + SHINE_PADDING_TOP}
                    rx={KEY_RADIUS}
                    width={shape.width - 2 * (PAD + SHINE_PADDING_SIDE)}
                    height={
                        shape.height -
                        2 * PAD -
                        SHINE_PADDING_TOP -
                        SHINE_PADDING_BOTTOM
                    }
                />
            ))}
            {props.shape.map((shape, j) => (
                <rect
                    key={j}
                    fill={color(DEFAULT_KEY_COLOR).lighten(SHINE_COLOR_DIFF)}
                    x={shape.offset.x + PAD + BORDER + SHINE_PADDING_SIDE}
                    y={shape.offset.y + PAD + BORDER + SHINE_PADDING_TOP}
                    rx={INNER_KEY_RADIUS}
                    width={
                        shape.width - 2 * (PAD + BORDER + SHINE_PADDING_SIDE)
                    }
                    height={
                        shape.height -
                        2 * (PAD + BORDER) -
                        SHINE_PADDING_TOP -
                        SHINE_PADDING_BOTTOM
                    }
                />
            ))}
            <Mounts {...props} />
        </>
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
