import React from "react";
import * as color from "color";

import {minmax, spreadSections} from "../../../internal/layout";
import {Layout} from "../../../internal/types/layout";
import {Key} from "../key";
import * as c from "../../cons";
import {DEFAULT_KEY_COLOR, START_SECTION_COLOR} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Plane, PlaneItem} from "../plane";
import {Blank} from "../../../internal/types/base";
import {StrokeShape} from "../stroke-shape";

export interface FootprintLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

export interface FootprintProps extends ReactProps {
    blank: Blank;
}

export const Footprint = (props: FootprintProps) => {
    const footprintColor = color(c.DEFAULT_KEY_COLOR)
        .darken(c.FOOTPRINT_COLOR_DARKEN)
        .hex();
    return (
        <g>
            <circle
                fill={footprintColor}
                cx={props.blank.stem[0]}
                cy={props.blank.stem[1]}
                r={c.CHERRY_MIDDLE_STEM_RADIUS}
            />
            <circle
                fill={footprintColor}
                cx={props.blank.stem[0] + c.CHERRY_PIN_OFFSET_X}
                cy={props.blank.stem[1]}
                r={c.CHERRY_PIN_RADIUS}
            />
            <circle
                fill={footprintColor}
                cx={props.blank.stem[0] - c.CHERRY_PIN_OFFSET_X}
                cy={props.blank.stem[1]}
                r={c.CHERRY_PIN_RADIUS}
            />
            <circle
                fill={footprintColor}
                cx={props.blank.stem[0] + c.CHERRY_POLE1_OFFSET_X}
                cy={props.blank.stem[1] + c.CHERRY_POLE1_OFFSET_Y}
                r={c.CHERRY_POLE_RADIUS}
            />
            <circle
                fill={footprintColor}
                cx={props.blank.stem[0] + c.CHERRY_POLE2_OFFSET_X}
                cy={props.blank.stem[1] + c.CHERRY_POLE2_OFFSET_Y}
                r={c.CHERRY_POLE_RADIUS}
            />
        </g>
    );
};

export const FootprintLayout = (props: FootprintLayoutProps) => {
    const [min, max] = minmax(props.layout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    return (
        <Plane pixelWidth={props.width} unitSize={[unitWidth, unitHeight]}>
            {props.layout.fixedKeys.map((key, i) => (
                <PlaneItem
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
