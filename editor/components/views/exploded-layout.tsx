import React from "react";
import * as color from "color";

import {minmaxLayout, spreadSections} from "../../../internal/measure";
import {Layout} from "../../../internal/types/base";
import {Key} from "../key";
import {DEFAULT_KEY_COLOR, START_SECTION_COLOR} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Plane, PlaneItem} from "../plane";

export interface ExplodedLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

// TODO draw in descending order to preserve overlap.
export const ExplodedLayout = (props: ExplodedLayoutProps) => {
    console.time("spread");
    const spreadLayout = spreadSections(props.layout);
    console.timeEnd("spread");

    const [min, max] = minmaxLayout(spreadLayout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    return (
        <Plane pixelWidth={props.width} unitSize={[unitWidth, unitHeight]}>
            {spreadLayout.fixedKeys.map((key) => (
                <PlaneItem
                    key={key.ref}
                    origin={min}
                    angle={key.angle}
                    position={key.position}
                >
                    <Key
                        blank={key.key}
                        color={DEFAULT_KEY_COLOR}
                        shelf={(key as any).shelf || []}
                        stem
                        stabs
                        notKey={key.notKey}
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
                                blank={key.key}
                                color={sectionColor}
                                shelf={(key as any).shelf || []}
                                stem
                                stabs
                                notKey={key.notKey}
                            />
                        </PlaneItem>
                    )),
                );
            })}
        </Plane>
    );
};
