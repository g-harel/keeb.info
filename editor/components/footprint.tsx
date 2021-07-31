import React from "react";
import * as color from "color";

import {rotateCoord} from "../../internal/layout";
import * as c from "../cons";
import {ReactProps} from "../../internal/types/util";
import {Blank} from "../../internal/types/base";

export interface FootprintProps extends ReactProps {
    blank: Blank;
    color: string;
}

export const Footprint = (props: FootprintProps) => {
    const contactColor = color(props.color)
        // .darken(c.FOOTPRINT_COLOR_DARKEN)
        // .darken(c.FOOTPRINT_COLOR_DARKEN)
        .hex();
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
                cx={props.blank.stem[0] + c.CHERRY_PIN_OFFSET_X}
                cy={props.blank.stem[1]}
                r={c.CHERRY_PIN_RADIUS}
            />
            <circle
                fill={contactColor}
                cx={props.blank.stem[0] - c.CHERRY_PIN_OFFSET_X}
                cy={props.blank.stem[1]}
                r={c.CHERRY_PIN_RADIUS}
            />
            <circle
                fill={props.color}
                cx={props.blank.stem[0] + c.CHERRY_POLE1_OFFSET_X}
                cy={props.blank.stem[1] + c.CHERRY_POLE1_OFFSET_Y}
                r={c.CHERRY_POLE_RADIUS}
            />
            <circle
                fill={props.color}
                cx={props.blank.stem[0] + c.CHERRY_POLE2_OFFSET_X}
                cy={props.blank.stem[1] + c.CHERRY_POLE2_OFFSET_Y}
                r={c.CHERRY_POLE_RADIUS}
            />
            {props.blank.stabilizers.map((stabilizer, i) => {
                const startStem = stabilizer.offset;
                const endStem = rotateCoord(
                    [startStem[0] + stabilizer.length, startStem[1]],
                    startStem,
                    stabilizer.angle,
                );
                const startBottom = rotateCoord(
                    [
                        startStem[0] + c.CHERRY_PLATE_STAB_BOTTOM_OFFSET,
                        startStem[1],
                    ],
                    startStem,
                    stabilizer.angle + 90,
                );
                const endBottom = rotateCoord(
                    [
                        endStem[0] + c.CHERRY_PLATE_STAB_BOTTOM_OFFSET,
                        endStem[1],
                    ],
                    endStem,
                    stabilizer.angle + 90,
                );
                const startTop = rotateCoord(
                    [
                        startStem[0] + c.CHERRY_PLATE_STAB_TOP_OFFSET,
                        startStem[1],
                    ],
                    startStem,
                    stabilizer.angle - 90,
                );
                const endTop = rotateCoord(
                    [endStem[0] + c.CHERRY_PLATE_STAB_TOP_OFFSET, endStem[1]],
                    endStem,
                    stabilizer.angle - 90,
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
