import React from "react";
import * as color from "color";

import {minmax, rotateCoord} from "../../../internal/layout";
import {Layout} from "../../../internal/types/layout";
import * as c from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Plane, PlaneItem} from "../plane";
import {Blank} from "../../../internal/types/base";

export interface FootprintLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

export interface FootprintProps extends ReactProps {
    blank: Blank;
}

export const Footprint = (props: FootprintProps) => {
    const drilledColor = color(c.DEFAULT_KEY_COLOR)
        .darken(c.FOOTPRINT_COLOR_DARKEN)
        .hex();
    const contactColor = color(c.DEFAULT_KEY_COLOR)
        .darken(c.FOOTPRINT_COLOR_DARKEN)
        .darken(c.FOOTPRINT_COLOR_DARKEN)
        .darken(c.FOOTPRINT_COLOR_DARKEN)
        .hex();
    return (
        <g>
            <circle
                fill={drilledColor}
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
                fill={drilledColor}
                cx={props.blank.stem[0] + c.CHERRY_POLE1_OFFSET_X}
                cy={props.blank.stem[1] + c.CHERRY_POLE1_OFFSET_Y}
                r={c.CHERRY_POLE_RADIUS}
            />
            <circle
                fill={drilledColor}
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
                            fill={drilledColor}
                            cx={startBottom[0]}
                            cy={startBottom[1]}
                            r={c.CHERRY_PLATE_STAB_BOTTOM_RADIUS}
                        />
                        <circle
                            fill={drilledColor}
                            cx={endBottom[0]}
                            cy={endBottom[1]}
                            r={c.CHERRY_PLATE_STAB_BOTTOM_RADIUS}
                        />
                        <circle
                            fill={drilledColor}
                            cx={startTop[0]}
                            cy={startTop[1]}
                            r={c.CHERRY_PLATE_STAB_TOP_RADIUS}
                        />
                        <circle
                            fill={drilledColor}
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

export const FootprintLayout = (props: FootprintLayoutProps) => {
    const [min, max] = minmax(props.layout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    return (
        <Plane pixelWidth={props.width} unitSize={[unitWidth, unitHeight]}>
            {props.layout.fixedKeys.map((key) => (
                <PlaneItem
                    key={key.ref}
                    origin={min}
                    angle={key.angle}
                    position={key.position}
                >
                    <Footprint blank={key.key} />
                </PlaneItem>
            ))}
            {props.layout.variableKeys.map((section) => {
                return section.options.map((option) =>
                    option.keys.map((key) => (
                        <PlaneItem
                            key={key.ref}
                            origin={min}
                            angle={key.angle}
                            position={key.position}
                        >
                            <Footprint blank={key.key} />
                        </PlaneItem>
                    )),
                );
            })}
        </Plane>
    );
};
