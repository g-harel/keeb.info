import color from "color";
import React from "react";

import {Blank} from "../../blank";
import {rotateCoord} from "../../point";
import {ReactProps} from "../../react";
import {Pooler} from "../view";
import {Stem} from "./stem";
import {COLOR_DARKEN, SIZE, WIDTH} from "./stem";

export interface MountProps extends ReactProps {
    pooler: Pooler;
    blank: Blank;
    color: string;
    offset: number;
    stem?: boolean;
    stabs?: boolean;
    noWire?: boolean;
}

const OFFSET = 2 * (SIZE + WIDTH / 2);
const ANGLE = 105;

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
                    [startStem[0] + OFFSET, startStem[1]],
                    startStem,
                    stabilizer.angle + ANGLE,
                );
                const endWire = rotateCoord(
                    [endStem[0] + OFFSET, endStem[1]],
                    endStem,
                    stabilizer.angle + 180 - ANGLE,
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
                                    .darken(COLOR_DARKEN)
                                    .hex()}
                                strokeWidth={WIDTH}
                                strokeLinecap="round"
                            />
                        )}
                    </g>
                );
            })}
    </>
);
