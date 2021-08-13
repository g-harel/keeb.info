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
    const [min, max] = minmaxKeysetKit(props.keyset.kits[0]);
    const unitWidth = max[0] - min[0];
    const unitHeight = max[1] - min[1];

    return (
        <Plane pixelWidth={props.width} unitSize={[unitWidth, unitHeight]}>
            {props.keyset.kits[0].keys.map((key, i) => (
                <PlaneItem
                    key={i}
                    origin={min}
                    angle={0}
                    position={key.position}
                >
                    <Key
                        blank={key.key}
                        color={key.color || DEFAULT_KEY_COLOR}
                        shelf={(key as any).shelf || []}
                        stem
                        stabs
                    />
                </PlaneItem>
            ))}
        </Plane>
    );
};
