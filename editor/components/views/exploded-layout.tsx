import React from "react";

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
import { colorSeries } from "../../../internal/colors";
import {Blocker} from "../blocker";

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
    const sectionColors = colorSeries(START_SECTION_COLOR, spreadLayout.variableKeys.length);

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
                return section.options.map((option) => (
                    <>
                        {option.blockers.map((blocker) => (
                            <PlaneItem
                                key={blocker.ref}
                                origin={min}
                                angle={blocker.angle}
                                position={blocker.position}
                            >
                                <Blocker
                                    pool={pool}
                                    shape={blocker.shape}
                                    color={sectionColors[i]}
                                />
                            </PlaneItem>
                        ))}
                        {option.keys.map((key) => (
                            <PlaneItem
                                key={key.ref}
                                origin={min}
                                angle={key.angle}
                                position={key.position}
                            >
                                <Key
                                    pool={pool}
                                    blank={key.key}
                                    color={sectionColors[i]}
                                    shelf={(key as any).shelf || []}
                                    stem
                                    stabs
                                />
                            </PlaneItem>
                        ))}
                    </>
                ));
            })}
        </Plane>
    );
};
