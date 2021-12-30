import color from "color";
import React from "react";

import {Blank} from "../../internal/blank";
import {rotateCoord} from "../../internal/point";
import {Point, RightAngle} from "../../internal/point";
import {ReactProps} from "../../internal/react";
import {genID} from "../../internal/identity";
import * as c from "../cons";
import {Pooler} from "./view";

export interface FootprintProps extends ReactProps {
    pooler: Pooler;
    blank: Blank;
    color: string;
    orientation: RightAngle;
}

export const Footprint = (props: FootprintProps) => {
    const contactColor = color(props.color)
        // .darken(c.FOOTPRINT_COLOR_DARKEN)
        // .darken(c.FOOTPRINT_COLOR_DARKEN)
        .hex();
    const angle = props.orientation + 90;
    const rotate = (p: Point): {cx: number; cy: number} => {
        const [cx, cy] = rotateCoord(p, props.blank.stem, angle);
        return {cx, cy};
    };

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
                        [
                            endStem[0] + c.CHERRY_PLATE_STAB_TOP_OFFSET,
                            endStem[1],
                        ],
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
        ),
    );
};
