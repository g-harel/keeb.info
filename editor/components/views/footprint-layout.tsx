import React from "react";
import * as color from "color";

import {minmax} from "../../../internal/layout";
import {Layout} from "../../../internal/types/layout";
import * as c from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Plane, PlaneItem} from "../plane";
import {Footprint} from "../footprint";

export interface FootprintLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

export const FootprintLayout = (props: FootprintLayoutProps) => {
    const [min, max] = minmax(props.layout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    let count = 0;
    const numColors = 11;
    const getColor = () => {
        count++;
        return color(c.START_FOOTPRINT_COLOR)
            .rotate(((count % numColors) / numColors) * 360)
            .hex();
    };

    return (
        <Plane pixelWidth={props.width} unitSize={[unitWidth, unitHeight]}>
            {props.layout.fixedKeys.map((key) => (
                <PlaneItem
                    key={key.ref}
                    origin={min}
                    angle={key.angle}
                    position={key.position}
                >
                    <Footprint blank={key.key} color={getColor()} />
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
                            <Footprint blank={key.key} color={getColor()} />
                        </PlaneItem>
                    )),
                );
            })}
        </Plane>
    );
};
