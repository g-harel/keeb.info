import React from "react";
import * as color from "color";

import {minmax, spreadSections} from "../../../internal/layout";
import {Layout} from "../../../internal/types/layout";
import {Key} from "../key";
import {DEFAULT_KEY_COLOR, START_SECTION_COLOR} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Plane, PlaneItem} from "../plane";

export interface ExplodedLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

export const ExpolodedLayout = (props: ExplodedLayoutProps) => {
    console.time("spread");
    const spreadLayout = spreadSections(props.layout);
    console.timeEnd("spread");

    const [min, max] = minmax(spreadLayout);
    const unitWidth = max.x - min.x;
    const unitHeight = max.y - min.y;

    return (
        <Plane
            pixelWidth={props.width}
            unitSize={{x: unitWidth, y: unitHeight}}
        >
            {spreadLayout.fixedKeys.map((key, i) => (
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
                            />
                        </PlaneItem>
                    )),
                );
            })}
        </Plane>
    );
};
