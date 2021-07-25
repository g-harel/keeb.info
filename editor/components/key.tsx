import React from "react";
import styled from "styled-components";
import * as color from "color";

import {rotateCoord} from "../../internal/layout";
import {Blank, Coord, Shape} from "../../internal/types/base";
import * as c from "../cons";
import {ReactProps} from "../../internal/types/util";
import {StrokeShape} from "./stroke-shape";

export interface KeyProps extends ReactProps {
    color: string;
    blank: Blank;
    shelf?: Shape[];
}

export interface StemProps extends ReactProps {
    coord: Coord;
    color: string;
}

export interface MountProps extends ReactProps {
    blank: Blank;
    color: string;
}

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
    <g>
        <Stem coord={props.blank.stem} color={props.color} />
        {props.blank.stabilizers.map((stabilizer, i) => {
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
                <g key={i}>
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
                </g>
            );
        })}
    </g>
);

export const Key = (props: KeyProps) => {
    let shineShape = props.blank.shape;
    if (props.shelf && props.shelf.length > 0) {
        shineShape = props.shelf;
    }
    return (
        <g>
            <StrokeShape
                borderWidth={c.BORDER}
                fillColor={props.color}
                padding={[c.PAD, c.PAD, c.PAD, c.PAD]}
                radius={c.KEY_RADIUS}
                shape={props.blank.shape}
                strokeColor={color(props.color)
                    .darken(c.STROKE_COLOR_DARKEN)
                    .hex()}
            />
            <StrokeShape
                borderWidth={c.BORDER}
                fillColor={color(props.color).lighten(c.SHINE_COLOR_DIFF).hex()}
                padding={[
                    c.SHINE_PADDING_TOP,
                    c.SHINE_PADDING_SIDE,
                    c.SHINE_PADDING_BOTTOM,
                    c.SHINE_PADDING_SIDE,
                ]}
                radius={c.KEY_RADIUS}
                shape={shineShape}
                strokeColor={color(props.color)
                    .darken(c.SHINE_COLOR_DIFF)
                    .hex()}
            />
            <Mounts blank={props.blank} color={props.color} />
        </g>
    );
};
