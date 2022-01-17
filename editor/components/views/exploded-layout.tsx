import React from "react";

import {colorSeries} from "../../../internal/color";
import {Layout, minmax, spreadSections} from "../../../internal/layout";
import {orderVertically} from "../../../internal/point";
import {ReactProps} from "../../../internal/react";
import {
    DEFAULT_KEY_COLOR,
    ROTATION_ORIGIN,
    SHELF_PADDING_TOP,
    START_SECTION_COLOR,
} from "../../cons";
import {Blocker} from "../blocker";
import {Key} from "../key";
import {View, ViewItem, createPool} from "../view";

export interface ExplodedLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

export const ExplodedLayout = (props: ExplodedLayoutProps) => {
    const spreadLayout = spreadSections(props.layout);
    const [min, max] = minmax(spreadLayout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];
    const sectionColors = colorSeries(
        START_SECTION_COLOR,
        spreadLayout.variableSections.length,
    );

    // Reorder the keys so they overlap correctly.

    const keys = orderVertically(
        (item) => [item.key.position, item.key.angle],
        ROTATION_ORIGIN,
        spreadLayout.fixedKeys.map((key) => ({
            key,
            color: DEFAULT_KEY_COLOR,
        })),
        spreadLayout.variableSections
            .map((section, i) => {
                return section.options.map((option) => {
                    return option.keys.map((key) => ({
                        key,
                        color: sectionColors[i],
                    }));
                });
            })
            .flat(3),
    );

    const [pool, pooler] = createPool();
    return (
        <View
            pixelWidth={props.width}
            unitSize={[unitWidth, unitHeight]}
            padTop={-Math.min(0, SHELF_PADDING_TOP)}
            pool={pool}
        >
            {spreadLayout.fixedBlockers.map((blocker) => (
                <ViewItem
                    key={blocker.ref}
                    origin={min}
                    angle={blocker.angle}
                    position={blocker.position}
                >
                    <Blocker
                        pooler={pooler}
                        boxes={blocker.boxes}
                        color={DEFAULT_KEY_COLOR}
                    />
                </ViewItem>
            ))}
            {spreadLayout.variableSections.map((section, i) => {
                return section.options.map((option) => {
                    return option.blockers.map((blocker) => (
                        <ViewItem
                            key={blocker.ref}
                            origin={min}
                            angle={blocker.angle}
                            position={blocker.position}
                        >
                            <Blocker
                                pooler={pooler}
                                boxes={blocker.boxes}
                                color={sectionColors[i]}
                            />
                        </ViewItem>
                    ));
                });
            })}
            {keys.map((key) => (
                <ViewItem
                    key={key.key.ref}
                    origin={min}
                    angle={key.key.angle}
                    position={key.key.position}
                >
                    <Key
                        uuid={key.key.ref}
                        pooler={pooler}
                        blank={key.key.blank}
                        color={key.color}
                        boxes={(key.key as any).shelf || []}
                        stem
                        stabs
                    />
                </ViewItem>
            ))}
        </View>
    );
};
