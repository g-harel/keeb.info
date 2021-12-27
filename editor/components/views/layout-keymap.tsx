import React from "react";

import {minmaxLayout} from "../../../internal/measure";
import {
    Layout,
    LayoutKeymap as LayoutKeymapType,
} from "../../../internal/types/base";
import {Key} from "../key";
import {SHINE_PADDING_TOP, ROTATION_ORIGIN} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {createPool, View, ViewItem} from "../view";
import {orderVertically} from "../../../internal/math";

export interface LayoutKeymapProps extends ReactProps {
    width: number;
    layout: Layout;
    keymap: LayoutKeymapType;
}

// TODO draw in descending order to preserve overlap.
// TODO support layers
// TODO support variable positions
export const LayoutKeymap = (props: LayoutKeymapProps) => {
    const [min, max] = minmaxLayout(props.layout);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    const keys = orderVertically(
        (item) => [item.key.position, item.key.angle],
        ROTATION_ORIGIN,
        props.layout.fixedKeys.map((key) => ({
            key,
            ...props.keymap.layers[0][key.ref],
        })),
    );

    const [pool, pooler] = createPool();
    return (
        <View
            pixelWidth={props.width}
            unitSize={[unitWidth, unitHeight]}
            padTop={-Math.min(0, SHINE_PADDING_TOP)}
            pool={pool}
        >
            {keys.map((key) => {
                return (
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
                            shelf={(key as any).shelf || []}
                            legend={key.legends}
                            stem
                            stabs
                        />
                    </ViewItem>
                );
            })}
        </View>
    );
};
