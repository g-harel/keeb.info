import React from "react";
import styled from "styled-components";
import * as color from "color";

import {rotateCoord} from "../../internal/layout";
import {Blank, Coord, Shape} from "../../internal/types/base";
import * as c from "../cons";

export interface KeyProps {
    color: string;
    blank: Blank;
    shelf?: Shape[];
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

export const Stem = (props: StemProps) => (
    <>
        <line
            x1={props.coord.x}
            y1={props.coord.y - c.STEM_SIZE}
            x2={props.coord.x}
            y2={props.coord.y + c.STEM_SIZE}
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN)}
            strokeWidth={c.STEM_WIDTH}
            strokeLinecap="round"
        />
        <line
            x1={props.coord.x - c.STEM_SIZE}
            y1={props.coord.y}
            x2={props.coord.x + c.STEM_SIZE}
            y2={props.coord.y}
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN)}
            strokeWidth={c.STEM_WIDTH}
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
                    x: startStem.x + c.WIRE_OFFSET,
                    y: startStem.y,
                },
                startStem,
                stabilizer.angle + c.WIRE_ANGLE,
            );
            const endWire = rotateCoord(
                {
                    x: endStem.x + c.WIRE_OFFSET,
                    y: endStem.y,
                },
                endStem,
                stabilizer.angle + 180 - c.WIRE_ANGLE,
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
                        stroke={color(props.color).darken(c.WIRE_COLOR_DARKEN)}
                        strokeWidth={c.WIRE_WIDTH}
                        strokeLinecap="round"
                    />
                </>
            );
        })}
    </>
);

export const Key = (props: KeyProps) => {
    let shineShape = props.blank.shape;
    if (props.shelf && props.shelf.length > 0) {
        shineShape = props.shelf;
    }
    return (
        <Group>
            {props.blank.shape.map((shape, j) => (
                // Outer stroke.
                <OuterRect
                    key={props.blank.shape.length * 1 + j}
                    fill={color(props.color).darken(c.STROKE_COLOR_DARKEN)}
                    x={shape.offset.x + c.PAD}
                    y={shape.offset.y + c.PAD}
                    rx={c.KEY_RADIUS}
                    width={shape.width - 2 * c.PAD}
                    height={shape.height - 2 * c.PAD}
                />
            ))}
            {props.blank.shape.map((shape, j) => (
                // Base fill.
                <rect
                    key={props.blank.shape.length * 2 + j}
                    fill={props.color}
                    x={shape.offset.x + c.PAD + c.BORDER}
                    y={shape.offset.y + c.PAD + c.BORDER}
                    rx={c.INNER_KEY_RADIUS}
                    width={shape.width - 2 * (c.PAD + c.BORDER)}
                    height={shape.height - 2 * (c.PAD + c.BORDER)}
                />
            ))}
            {shineShape.map((shape, j) => (
                // Shine stroke.
                <rect
                    key={props.blank.shape.length * 3 + j}
                    fill={color(props.color).darken(c.SHINE_COLOR_DIFF)}
                    x={shape.offset.x + c.PAD + c.SHINE_PADDING_SIDE}
                    y={shape.offset.y + c.PAD + c.SHINE_PADDING_TOP}
                    rx={c.KEY_RADIUS}
                    width={shape.width - 2 * (c.PAD + c.SHINE_PADDING_SIDE)}
                    height={
                        shape.height -
                        2 * c.PAD -
                        c.SHINE_PADDING_TOP -
                        c.SHINE_PADDING_BOTTOM
                    }
                />
            ))}
            {shineShape.map((shape, j) => (
                // Shine fill.
                <rect
                    key={props.blank.shape.length * 4 + j}
                    fill={color(props.color).lighten(c.SHINE_COLOR_DIFF)}
                    x={shape.offset.x + c.PAD + c.BORDER + c.SHINE_PADDING_SIDE}
                    y={shape.offset.y + c.PAD + c.BORDER + c.SHINE_PADDING_TOP}
                    rx={c.INNER_KEY_RADIUS}
                    width={
                        shape.width -
                        2 * (c.PAD + c.BORDER + c.SHINE_PADDING_SIDE)
                    }
                    height={
                        shape.height -
                        2 * (c.PAD + c.BORDER) -
                        c.SHINE_PADDING_TOP -
                        c.SHINE_PADDING_BOTTOM
                    }
                />
            ))}
            <Mounts blank={props.blank} color={props.color} />
        </Group>
    );
};
