import React from "react";
import styled from "styled-components";
import * as color from "color";

import {rotateCoord} from "../../internal/measure";
import {Blank, Pair, Shape} from "../../internal/types/base";
import * as c from "../cons";
import {ReactProps} from "../../internal/types/util";
import {StrokeShape} from "./stroke-shape";
import {convertCartesiantToAngle} from "../../internal/convert";

export interface KeyProps extends ReactProps {
    color: string;
    blank: Blank;
    shelf?: Shape[];
    stem?: boolean;
    stabs?: boolean;
    notKey?: boolean;
}

export interface StemProps extends ReactProps {
    coord: Pair;
    color: string;
}

export interface MountProps extends ReactProps {
    blank: Blank;
    color: string;
    stem?: boolean;
    stabs?: boolean;
}

export const Stem = (props: StemProps) => (
    <>
        <line
            x1={props.coord[0]}
            y1={props.coord[1] - c.STEM_SIZE}
            x2={props.coord[0]}
            y2={props.coord[1] + c.STEM_SIZE}
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN)}
            strokeWidth={c.STEM_WIDTH}
            strokeLinecap="round"
        />
        <line
            x1={props.coord[0] - c.STEM_SIZE}
            y1={props.coord[1]}
            x2={props.coord[0] + c.STEM_SIZE}
            y2={props.coord[1]}
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN)}
            strokeWidth={c.STEM_WIDTH}
            strokeLinecap="round"
        />
    </>
);

export const Mounts = (props: MountProps) => (
    <g>
        {props.stem && <Stem coord={props.blank.stem} color={props.color} />}
        {props.stabs &&
            props.blank.stabilizers.map((stabilizer, i) => {
                const angle = convertCartesiantToAngle(stabilizer.angle);
                const startStem = stabilizer.offset;
                const endStem = rotateCoord(
                    [startStem[0] + stabilizer.length, startStem[1]],
                    startStem,
                    angle,
                );
                const startWire = rotateCoord(
                    [startStem[0] + c.WIRE_OFFSET, startStem[1]],
                    startStem,
                    angle + c.WIRE_ANGLE,
                );
                const endWire = rotateCoord(
                    [endStem[0] + c.WIRE_OFFSET, endStem[1]],
                    endStem,
                    angle + 180 - c.WIRE_ANGLE,
                );
                return (
                    <g key={i}>
                        <Stem coord={startStem} color={props.color} />
                        <Stem coord={endStem} color={props.color} />
                        <line
                            x1={startWire[0]}
                            y1={startWire[1]}
                            x2={endWire[0]}
                            y2={endWire[1]}
                            stroke={color(props.color).darken(
                                c.WIRE_COLOR_DARKEN,
                            )}
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
    const shineColor = color(props.color).lighten(c.SHINE_COLOR_DIFF).hex();
    return (
        <g>
            <StrokeShape
                borderWidth={c.BORDER}
                fillColor={props.notKey ? shineColor : props.color}
                padding={[c.PAD, c.PAD, c.PAD, c.PAD]}
                radius={c.KEY_RADIUS}
                shape={props.blank.shape}
                strokeColor={color(props.color)
                    .darken(c.STROKE_COLOR_DARKEN)
                    .hex()}
            />
            {!props.notKey && (
                <StrokeShape
                    borderWidth={c.BORDER}
                    fillColor={shineColor}
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
            )}
            {!props.notKey && (
                <Mounts
                    blank={props.blank}
                    color={props.color}
                    stem={props.stem}
                    stabs={props.stabs}
                />
            )}
        </g>
    );
};
