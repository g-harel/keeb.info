import color from "color";
import React from "react";

import {Blank} from "../../../internal/blank";
import {rotateCoord} from "../../../internal/point";
import {ReactProps} from "../../../internal/react";
import * as c from "../../cons";
import {Pooler} from "../view";
import {Stem} from "./stem";

export interface MountProps extends ReactProps {
    pooler: Pooler;
    blank: Blank;
    color: string;
    offset: number;
    stem?: boolean;
    stabs?: boolean;
    noWire?: boolean;
}

export const Mounts = (props: MountProps) => (
    <>
        {props.stem && (
            <Stem
                pooler={props.pooler}
                coord={[
                    props.blank.stem[0],
                    props.blank.stem[1] + props.offset,
                ]}
                color={props.color}
            />
        )}
        {props.stabs &&
            props.blank.stabilizers.map((stabilizer, i) => {
                const startStem = stabilizer.offset;
                const endStem = rotateCoord(
                    [startStem[0] + stabilizer.length, startStem[1]],
                    startStem,
                    stabilizer.angle,
                );
                const startWire = rotateCoord(
                    [startStem[0] + c.WIRE_OFFSET, startStem[1]],
                    startStem,
                    stabilizer.angle + c.WIRE_ANGLE,
                );
                const endWire = rotateCoord(
                    [endStem[0] + c.WIRE_OFFSET, endStem[1]],
                    endStem,
                    stabilizer.angle + 180 - c.WIRE_ANGLE,
                );
                return (
                    <g key={i}>
                        <Stem
                            pooler={props.pooler}
                            coord={[startStem[0], startStem[1] + props.offset]}
                            color={props.color}
                        />
                        <Stem
                            pooler={props.pooler}
                            coord={[endStem[0], endStem[1] + props.offset]}
                            color={props.color}
                        />
                        {!props.noWire && (
                            <line
                                x1={startWire[0]}
                                y1={startWire[1] + props.offset}
                                x2={endWire[0]}
                                y2={endWire[1] + props.offset}
                                stroke={color(props.color)
                                    .darken(c.WIRE_COLOR_DARKEN)
                                    .hex()}
                                strokeWidth={c.WIRE_WIDTH}
                                strokeLinecap="round"
                            />
                        )}
                    </g>
                );
            })}
    </>
);
