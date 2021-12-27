import React from "react";
import color from "color";

import {minmaxLayout} from "../../../internal/measure";
import {Layout} from "../../../internal/layout";
import * as c from "../../cons";
import {ReactProps} from "../../../internal/react";
import {View, ViewItem, createPool} from "../view";
import {Footprint} from "../footprint";

export interface FootprintLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

export const FootprintLayout = (props: FootprintLayoutProps) => {
    const [min, max] = minmaxLayout(props.layout);
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
                        blank={key.key}
                        orientation={key.orientation}
                        color={getColor()}
                    />
                </ViewItem>
            ))}
            {props.layout.variableKeys.map((section) => {
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
                                blank={key.key}
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
