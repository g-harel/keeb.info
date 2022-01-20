import color from "color";
import React from "react";

import {Blank} from "../blank";
import {genID} from "../identity";
import {rotateCoord} from "../point";
import {Point, RightAngle} from "../point";
import {ReactProps} from "../react";
import {Pooler} from "../../website/components/view";

export interface FootprintProps extends ReactProps {
    pooler: Pooler;
    blank: Blank;
    color: string;
    orientation: RightAngle;
}

// https://github.com/mohitg11/GH-CAD-Resources/blob/master/MX%20Series.pdf
// https://github.com/mohitg11/GH-CAD-Resources/blob/master/MXSpec.pdf
const U = 0.61; // Unit to convert inch measurements to layout grid.
const MIDDLE_STEM_RADIUS = 0.157 / U / 2;
const PIN_RADIUS = 0.067 / U / 2;
const PIN_OFFSET_X = (4 * 0.05) / U;
const POLE_RADIUS = 0.059 / U / 2;
const POLE1_OFFSET_X = (-3 * 0.05) / U;
const POLE2_OFFSET_X = (2 * 0.05) / U;
const POLE1_OFFSET_Y = (-2 * 0.05) / U;
const POLE2_OFFSET_Y = (-4 * 0.05) / U;
const PLATE_STAB_TOP_OFFSET = ((U / 15.6) * 7) / U;
const PLATE_STAB_BOTTOM_OFFSET = ((U / 15.6) * 8.24) / U;
const PLATE_STAB_TOP_RADIUS = ((U / 15.6) * 3.05) / U / 2;
const PLATE_STAB_BOTTOM_RADIUS = ((U / 15.6) * 4) / U / 2;
const FOOTPRINT_COLOR_DARKEN = 0.1;

export const Footprint = (props: FootprintProps) => {
    const contactColor = color(props.color)
        .darken(FOOTPRINT_COLOR_DARKEN)
        .darken(FOOTPRINT_COLOR_DARKEN)
        .hex();
    const angle = props.orientation + 90;
    const rotate = (p: Point): {cx: number; cy: number} => {
        const [cx, cy] = rotateCoord(p, props.blank.stem, angle);
        return {cx, cy};
    };

    // TODO pin/pole look inverted here.
    return props.pooler(
        genID("footprint", {
            angle,
            color: props.color,
            position: props.blank.stem,
        }),
        () => (
            <g>
                <circle
                    fill={props.color}
                    cx={props.blank.stem[0]}
                    cy={props.blank.stem[1]}
                    r={MIDDLE_STEM_RADIUS}
                />
                <circle
                    fill={contactColor}
                    {...rotate([
                        props.blank.stem[0] + PIN_OFFSET_X,
                        props.blank.stem[1],
                    ])}
                    r={PIN_RADIUS}
                />
                <circle
                    fill={contactColor}
                    {...rotate([
                        props.blank.stem[0] - PIN_OFFSET_X,
                        props.blank.stem[1],
                    ])}
                    r={PIN_RADIUS}
                />
                <circle
                    fill={props.color}
                    {...rotate([
                        props.blank.stem[0] + POLE1_OFFSET_X,
                        props.blank.stem[1] + POLE1_OFFSET_Y,
                    ])}
                    r={POLE_RADIUS}
                />
                <circle
                    fill={props.color}
                    {...rotate([
                        props.blank.stem[0] + POLE2_OFFSET_X,
                        props.blank.stem[1] + POLE2_OFFSET_Y,
                    ])}
                    r={POLE_RADIUS}
                />
                {props.blank.stabilizers.map((stabilizer, i) => {
                    const startStem = stabilizer.offset;
                    const endStem = rotateCoord(
                        [startStem[0] + stabilizer.length, startStem[1]],
                        startStem,
                        stabilizer.angle,
                    );
                    const startBottom = rotateCoord(
                        [startStem[0] + PLATE_STAB_BOTTOM_OFFSET, startStem[1]],
                        startStem,
                        stabilizer.angle + 90,
                    );
                    const endBottom = rotateCoord(
                        [endStem[0] + PLATE_STAB_BOTTOM_OFFSET, endStem[1]],
                        endStem,
                        stabilizer.angle + 90,
                    );
                    const startTop = rotateCoord(
                        [startStem[0] + PLATE_STAB_TOP_OFFSET, startStem[1]],
                        startStem,
                        stabilizer.angle - 90,
                    );
                    const endTop = rotateCoord(
                        [endStem[0] + PLATE_STAB_TOP_OFFSET, endStem[1]],
                        endStem,
                        stabilizer.angle - 90,
                    );
                    return (
                        <g key={i}>
                            <circle
                                fill={props.color}
                                cx={startBottom[0]}
                                cy={startBottom[1]}
                                r={PLATE_STAB_BOTTOM_RADIUS}
                            />
                            <circle
                                fill={props.color}
                                cx={endBottom[0]}
                                cy={endBottom[1]}
                                r={PLATE_STAB_BOTTOM_RADIUS}
                            />
                            <circle
                                fill={props.color}
                                cx={startTop[0]}
                                cy={startTop[1]}
                                r={PLATE_STAB_TOP_RADIUS}
                            />
                            <circle
                                fill={props.color}
                                cx={endTop[0]}
                                cy={endTop[1]}
                                r={PLATE_STAB_TOP_RADIUS}
                            />
                        </g>
                    );
                })}
            </g>
        ),
    );
};
