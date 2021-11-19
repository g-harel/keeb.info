import React from "react";

import {minmaxLayout} from "../../../internal/measure";
import {
    Layout,
    LayoutKeymap as LayoutKeymapType,
} from "../../../internal/types/base";
import {Key} from "../key";
import {SHINE_PADDING_TOP} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {createPool, View, ViewItem} from "../view";

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

    const [pool, pooler] = createPool();
    return (
        <View
            pixelWidth={props.width}
            unitSize={[unitWidth, unitHeight]}
            padTop={-Math.min(0, SHINE_PADDING_TOP)}
            pool={pool}
        >
            {props.layout.fixedKeys.map((key) => {
                const {color, legends} = props.keymap.layers[0][key.ref];
                return (
                    <ViewItem
                        key={key.ref}
                        origin={min}
                        angle={key.angle}
                        position={key.position}
                    >
                        <Key
                            uuid={key.ref}
                            pooler={pooler}
                            blank={key.key}
                            color={color}
                            shelf={(key as any).shelf || []}
                            legend={legends}
                            stem
                            stabs
                        />
                    </ViewItem>
                );
            })}
        </View>
    );
};
