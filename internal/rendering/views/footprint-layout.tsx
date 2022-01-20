import color from "color";
import React from "react";

import {Layout, minmax} from "../../../internal/layout";
import {ReactProps} from "../../../internal/react";
import {Footprint} from "../footprint";
import {View, ViewItem, createPool} from "../view";

export interface FootprintLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

export const START_COLOR = "#e2a8a8";

export const FootprintLayout = (props: FootprintLayoutProps) => {
    const [min, max] = minmax(props.layout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    let count = 0;
    const numColors = 11;
    const getColor = () => {
        count++;
        return color(START_COLOR)
            .rotate(((count % numColors) / numColors) * 360)
            .hex();
    };

    const [pool, pooler] = createPool();
    // TODO render all blockers below.
    return (
        <View
            pixelWidth={props.width}
            unitSize={[unitWidth, unitHeight]}
            pool={pool}
            padTop={0}
        >
            {props.layout.fixedKeys.map((key) => (
                <ViewItem
                    key={key.ref}
                    origin={min}
                    angle={key.angle}
                    position={key.position}
                >
                    <Footprint
                        pooler={pooler}
                        blank={key.blank}
                        orientation={key.orientation}
                        color={getColor()}
                    />
                </ViewItem>
            ))}
            {props.layout.variableSections.map((section) => {
                return section.options.map((option) =>
                    option.keys.map((key) => (
                        <ViewItem
                            key={key.ref}
                            origin={min}
                            angle={key.angle}
                            position={key.position}
                        >
                            <Footprint
                                pooler={pooler}
                                blank={key.blank}
                                orientation={key.orientation}
                                color={getColor()}
                            />
                        </ViewItem>
                    )),
                );
            })}
        </View>
    );
};
