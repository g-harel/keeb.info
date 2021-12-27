import color from "color";
import React from "react";

import {Angle, Blank, Pair, Shape, UUID} from "../../internal/types/base";
import {rotateCoord} from "../../internal/math";
import * as c from "../cons";
import {ReactProps} from "../../internal/types/util";
import {Pooler} from "./view";
import {calcKeycap} from "../../internal/key";

export interface SelectionItem {
    blank: Blank;
    shelf?: Shape[];
    position: Pair;
    angle: Angle;
}

export interface SelectionProps extends ReactProps {
    uuid: UUID;
    color: string;
    pooler: Pooler;
    selection: SelectionItem[];
}

export const Selection = (props: SelectionProps) => {
    // TODO finish implementing.
    const keycapBases: Pair[][] = props.selection.map((key) => {
        const {basePathPoints} = calcKeycap({
            base: key.blank.shape,
            shelf: key.shelf,
        });
        return basePathPoints.map((point) => {
            return rotateCoord(
                [point[0] + key.position[0], point[1] + key.position[1]],
                c.ROTATION_ORIGIN,
                key.angle,
            );
        });
    });
    return <g id={props.uuid}></g>;
};
