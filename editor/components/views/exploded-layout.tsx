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
import {createPool, Plane, PlaneItem} from "../plane";
import {colorSeries} from "../../../internal/colors";
import {Blocker} from "../blocker";

export interface ExplodedLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

// TODO draw in descending order to preserve overlap.
export const ExplodedLayout = (props: ExplodedLayoutProps) => {
    const spreadLayout = spreadSections(props.layout);
    const [min, max] = minmaxLayout(spreadLayout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];
    const sectionColors = colorSeries(
        START_SECTION_COLOR,
        spreadLayout.variableKeys.length,
    );

    const [pool, pooler] = createPool();
    return (
        <Plane
            pixelWidth={props.width}
            unitSize={[unitWidth, unitHeight]}
            padTop={-Math.min(0, SHINE_PADDING_TOP)}
            pool={pool}
        >
            {spreadLayout.fixedBlockers.map((blocker) => (
                <PlaneItem
                    key={blocker.ref}
                    origin={min}
                    angle={blocker.angle}
                    position={blocker.position}
                >
                    <Blocker
                        pooler={pooler}
                        shape={blocker.shape}
                        color={DEFAULT_KEY_COLOR}
                    />
                </PlaneItem>
            ))}
            {spreadLayout.fixedKeys.map((key) => (
                <PlaneItem
                    key={key.ref}
                    origin={min}
                    angle={key.angle}
                    position={key.position}
                >
                    <Key
                        uuid={key.ref}
                        pooler={pooler}
                        blank={key.key}
                        color={DEFAULT_KEY_COLOR}
                        shelf={(key as any).shelf || []}
                        stem
                        stabs
                    />
                </PlaneItem>
            ))}
            {spreadLayout.variableKeys.map((section, i) => {
                return section.options.map((option) => {
                    return option.blockers.map((blocker) => (
                        <PlaneItem
                            key={blocker.ref}
                            origin={min}
                            angle={blocker.angle}
                            position={blocker.position}
                        >
                            <Blocker
                                pooler={pooler}
                                shape={blocker.shape}
                                color={sectionColors[i]}
                            />
                        </PlaneItem>
                    ));
                });
            })}
            {spreadLayout.variableKeys.map((section, i) => {
                return section.options.map((option) => {
                    return option.keys.map((key) => (
                        <PlaneItem
                            key={key.ref}
                            origin={min}
                            angle={key.angle}
                            position={key.position}
                        >
                            <Key
                                uuid={key.ref}
                                pooler={pooler}
                                blank={key.key}
                                color={sectionColors[i]}
                                shelf={(key as any).shelf || []}
                                stem
                                stabs
                            />
                        </PlaneItem>
                    ));
                });
            })}
        </Plane>
    );
};
