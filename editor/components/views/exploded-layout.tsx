import React from "react";
import * as color from "color";

import {minmaxLayout, spreadSections} from "../../../internal/measure";
import {Layout} from "../../../internal/types/base";
import {Key} from "../key";
import {
    DEFAULT_KEY_COLOR,
    SHINE_PADDING_TOP,
    START_SECTION_COLOR,
} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Pool, Plane, PlaneItem} from "../plane";

export interface ExplodedLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

// TODO draw in descending order to preserve overlap.
// TODO render blockers differently.
export const ExplodedLayout = (props: ExplodedLayoutProps) => {
    const spreadLayout = spreadSections(props.layout);
    const [min, max] = minmaxLayout(spreadLayout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    const pool = new Pool();
    return (
        <Plane
            pixelWidth={props.width}
            unitSize={[unitWidth, unitHeight]}
            padTop={-Math.min(0, SHINE_PADDING_TOP)}
            pool={pool}
        >
            {spreadLayout.fixedKeys.map((key) => (
                <PlaneItem
                    key={key.ref}
                    origin={min}
                    angle={key.angle}
                    position={key.position}
                >
                    <Key
                        pool={pool}
                        blank={key.key}
                        color={DEFAULT_KEY_COLOR}
                        shelf={(key as any).shelf || []}
                        stem
                        stabs
                    />
                </PlaneItem>
            ))}
            {spreadLayout.variableKeys.map((section, i, sections) => {
                const sectionColor = color(START_SECTION_COLOR)
                    .rotate((i / sections.length) * 360)
                    .hex();
                return section.options.map((option) =>
                    option.keys.map((key) => (
                        <PlaneItem
                            key={key.ref}
                            origin={min}
                            angle={key.angle}
                            position={key.position}
                        >
                            <Key
                                pool={pool}
                                blank={key.key}
                                color={sectionColor}
                                shelf={(key as any).shelf || []}
                                stem
                                stabs
                            />
                        </PlaneItem>
                    )),
                );
            })}
        </Plane>
    );
};
