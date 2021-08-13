import React from "react";
import * as color from "color";

import {rotateCoord} from "../../internal/layout";
import * as c from "../cons";
import {ReactProps} from "../../internal/types/util";
import {Angle, Blank, Cartesian, Pair} from "../../internal/types/base";
import {convertCartesiantToAngle} from "../../internal/convert";

export interface FootprintProps extends ReactProps {
    blank: Blank;
    color: string;
    orientation: Cartesian;
    notKey?: boolean;
}

export const Footprint = (props: FootprintProps) => {
    const contactColor = color(props.color)
        // .darken(c.FOOTPRINT_COLOR_DARKEN)
        // .darken(c.FOOTPRINT_COLOR_DARKEN)
        .hex();
    const angle = convertCartesiantToAngle(props.orientation) + 90;
    const rotate = (p: Pair): {cx: number; cy: number} => {
        const [cx, cy] = rotateCoord(p, props.blank.stem, angle);
        return {cx, cy};
    };

    if (props.notKey) {
        return (
            <g>
                <rect
                    fill={props.color}
                    x={props.blank.stem[0] - c.NOT_KEY_FOOTPRINT_SIZE / 2}
                    y={props.blank.stem[1] - c.NOT_KEY_FOOTPRINT_SIZE / 2}
                    width={c.NOT_KEY_FOOTPRINT_SIZE}
                    height={c.NOT_KEY_FOOTPRINT_SIZE}
                />
            </g>
        );
    }

    return (
        <g>
            <circle
                fill={props.color}
                cx={props.blank.stem[0]}
                cy={props.blank.stem[1]}
                r={c.CHERRY_MIDDLE_STEM_RADIUS}
            />
            <circle
                fill={contactColor}
                {...rotate([
                    props.blank.stem[0] + c.CHERRY_PIN_OFFSET_X,
                    props.blank.stem[1],
                ])}
                r={c.CHERRY_PIN_RADIUS}
            />
            <circle
                fill={contactColor}
                {...rotate([
                    props.blank.stem[0] - c.CHERRY_PIN_OFFSET_X,
                    props.blank.stem[1],
                ])}
                r={c.CHERRY_PIN_RADIUS}
            />
            <circle
                fill={props.color}
                {...rotate([
                    props.blank.stem[0] + c.CHERRY_POLE1_OFFSET_X,
                    props.blank.stem[1] + c.CHERRY_POLE1_OFFSET_Y,
                ])}
                r={c.CHERRY_POLE_RADIUS}
            />
            <circle
                fill={props.color}
                {...rotate([
                    props.blank.stem[0] + c.CHERRY_POLE2_OFFSET_X,
                    props.blank.stem[1] + c.CHERRY_POLE2_OFFSET_Y,
                ])}
                r={c.CHERRY_POLE_RADIUS}
            />
            {props.blank.stabilizers.map((stabilizer, i) => {
                const stabilizerAngle = convertCartesiantToAngle(
                    stabilizer.angle,
                );
                const startStem = stabilizer.offset;
                const endStem = rotateCoord(
                    [startStem[0] + stabilizer.length, startStem[1]],
                    startStem,
                    stabilizerAngle,
                );
                const startBottom = rotateCoord(
                    [
                        startStem[0] + c.CHERRY_PLATE_STAB_BOTTOM_OFFSET,
                        startStem[1],
                    ],
                    startStem,
                    stabilizerAngle + 90,
                );
                const endBottom = rotateCoord(
                    [
                        endStem[0] + c.CHERRY_PLATE_STAB_BOTTOM_OFFSET,
                        endStem[1],
                    ],
                    endStem,
                    stabilizerAngle + 90,
                );
                const startTop = rotateCoord(
                    [
                        startStem[0] + c.CHERRY_PLATE_STAB_TOP_OFFSET,
                        startStem[1],
                    ],
                    startStem,
                    stabilizerAngle - 90,
                );
                const endTop = rotateCoord(
                    [endStem[0] + c.CHERRY_PLATE_STAB_TOP_OFFSET, endStem[1]],
                    endStem,
                    stabilizerAngle - 90,
                );
                return (
                    <g key={i}>
                        <circle
                            fill={props.color}
                            cx={startBottom[0]}
                            cy={startBottom[1]}
                            r={c.CHERRY_PLATE_STAB_BOTTOM_RADIUS}
                        />
                        <circle
                            fill={props.color}
                            cx={endBottom[0]}
                            cy={endBottom[1]}
                            r={c.CHERRY_PLATE_STAB_BOTTOM_RADIUS}
                        />
                        <circle
                            fill={props.color}
                            cx={startTop[0]}
                            cy={startTop[1]}
                            r={c.CHERRY_PLATE_STAB_TOP_RADIUS}
                        />
                        <circle
                            fill={props.color}
                            cx={endTop[0]}
                            cy={endTop[1]}
                            r={c.CHERRY_PLATE_STAB_TOP_RADIUS}
                        />
                    </g>
                );
            })}
        </g>
    );
};
