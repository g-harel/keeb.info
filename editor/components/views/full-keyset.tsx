import React from "react";
import * as color from "color";

import {minmaxKeysetKit} from "../../../internal/measure";
import {Keyset} from "../../../internal/types/base";
import {Key} from "../key";
import {DEFAULT_KEY_COLOR} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Plane, PlaneItem} from "../plane";

export interface FullKeysetProps extends ReactProps {
    width: number;
    keyset: Keyset;
}

export const FullKeyset = (props: FullKeysetProps) => {
    // TODO better layout.
    const minX = [0];
    let maxWidth = 0;
    const heights = [0];
    for (const kit of props.keyset.kits) {
        const [min, max] = minmaxKeysetKit(kit);
        maxWidth = Math.max(maxWidth, max[0] - min[0]);
        minX.unshift(min[0]);
        heights.unshift(heights[0] + max[1] - min[1]);
    }

    return (
        <Plane pixelWidth={props.width} unitSize={[maxWidth, heights[0]]}>
            {props.keyset.kits.map((kit, i) => {
                const index = props.keyset.kits.length - i;
                return kit.keys.map((key, j) => (
                    <PlaneItem
                        key={j}
                        origin={[minX[index], 0]}
                        angle={0}
                        position={[
                            key.position[0],
                            key.position[1] + heights[index],
                        ]}
                    >
                        <Key
                            blank={key.key}
                            color={key.color || DEFAULT_KEY_COLOR}
                            shelf={(key as any).shelf || []}
                            stem
                            stabs
                        />
                    </PlaneItem>
                ));
            })}
        </Plane>
    );
};
