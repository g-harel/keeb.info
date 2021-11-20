import React from "react";

import {minmaxLayout, spreadSections} from "../../../internal/measure";
import {Color, Layout, LayoutKey} from "../../../internal/types/base";
import {Key} from "../key";
import {
    DEFAULT_KEY_COLOR,
    SHINE_PADDING_TOP,
    START_SECTION_COLOR,
} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {createPool, View, ViewItem} from "../view";
import {colorSeries} from "../../../internal/colors";
import {Blocker} from "../blocker";

export interface ExplodedLayoutProps extends ReactProps {
    width: number;
    layout: Layout;
}

interface OrderedKey {
    key: LayoutKey;
    color: Color;
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

    // Reorder the keys so they overlap correctly.
    const keys: OrderedKey[] = spreadLayout.fixedKeys
        .map((key) => ({
            key,
            color: DEFAULT_KEY_COLOR,
        }))
        .concat(
            spreadLayout.variableKeys
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
    keys.sort((a, b) => a.key.position[1] - b.key.position[1]);

    const [pool, pooler] = createPool();
    return (
        <View
            pixelWidth={props.width}
            unitSize={[unitWidth, unitHeight]}
            padTop={-Math.min(0, SHINE_PADDING_TOP)}
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
                        shape={blocker.shape}
                        color={DEFAULT_KEY_COLOR}
                    />
                </ViewItem>
            ))}
            {spreadLayout.variableKeys.map((section, i) => {
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
                                shape={blocker.shape}
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
                        blank={key.key.key}
                        color={key.color}
                        shelf={(key.key as any).shelf || []}
                        stem
                        stabs
                    />
                </ViewItem>
            ))}
        </View>
    );
};
