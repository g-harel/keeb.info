import React from "react";
import styled from "styled-components";
import * as color from "color";

import {rotateCoord} from "../../internal/layout";
import {Blank, Coord} from "../../internal/types/base";

export interface KeyProps {
    color: string;
    blank: Blank;
}

export interface StemProps {
    coord: Coord;
    color: string;
}

export interface MountProps {
    blank: Blank;
    color: string;
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
const STEM_COLOR_DARKEN = 0;
const WIRE_WIDTH = STEM_WIDTH;
const WIRE_COLOR_DARKEN = STEM_COLOR_DARKEN;
const WIRE_OFFSET = 2 * (STEM_SIZE + WIRE_WIDTH / 2);
const WIRE_ANGLE = 105;

export const Stem = (props: StemProps) => (
    <>
        <line
            x1={props.coord.x}
            y1={props.coord.y - STEM_SIZE}
            x2={props.coord.x}
            y2={props.coord.y + STEM_SIZE}
            stroke={color(props.color).darken(STEM_COLOR_DARKEN)}
            strokeWidth={STEM_WIDTH}
            strokeLinecap="round"
        />
        <line
            x1={props.coord.x - STEM_SIZE}
            y1={props.coord.y}
            x2={props.coord.x + STEM_SIZE}
            y2={props.coord.y}
            stroke={color(props.color).darken(STEM_COLOR_DARKEN)}
            strokeWidth={STEM_WIDTH}
            strokeLinecap="round"
        />
    </>
);

export const Mounts = (props: MountProps) => (
    <>
        <Stem coord={props.blank.stem} color={props.color} />
        {props.blank.stabilizers.map((stabilizer) => {
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
                    <Stem coord={startStem} color={props.color} />
                    <Stem coord={endStem} color={props.color} />
                    <line
                        x1={startWire.x}
                        y1={startWire.y}
                        x2={endWire.x}
                        y2={endWire.y}
                        stroke={color(props.color).darken(WIRE_COLOR_DARKEN)}
                        strokeWidth={WIRE_WIDTH}
                        strokeLinecap="round"
                    />
                </>
            );
        })}
    </>
);

export const Key = (props: KeyProps) => {
    return (
        <Group>
            {props.blank.shape.map((shape, j) => (
                <OuterRect
                    key={props.blank.shape.length * 1 + j}
                    fill={color(props.color).darken(STROKE_COLOR_DARKEN)}
                    x={shape.offset.x + PAD}
                    y={shape.offset.y + PAD}
                    rx={KEY_RADIUS}
                    width={shape.width - 2 * PAD}
                    height={shape.height - 2 * PAD}
                />
            ))}
            {props.blank.shape.map((shape, j) => (
                <rect
                    key={props.blank.shape.length * 2 + j}
                    fill={props.color}
                    x={shape.offset.x + PAD + BORDER}
                    y={shape.offset.y + PAD + BORDER}
                    rx={INNER_KEY_RADIUS}
                    width={shape.width - 2 * (PAD + BORDER)}
                    height={shape.height - 2 * (PAD + BORDER)}
                />
            ))}
            {props.blank.shape.map((shape, j) => (
                <rect
                    key={props.blank.shape.length * 3 + j}
                    fill={color(props.color).darken(SHINE_COLOR_DIFF)}
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
            {props.blank.shape.map((shape, j) => (
                <rect
                    key={props.blank.shape.length * 4 + j}
                    fill={color(props.color).lighten(SHINE_COLOR_DIFF)}
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
            <Mounts blank={props.blank} color={props.color} />
        </Group>
    );
};
