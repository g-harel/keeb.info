import color from "color";
import React from "react";

import {
    Angle,
    Blank,
    Pair,
    Shape,
    SpaceBetweenLayout,
    UUID,
} from "../../internal/types/base";
import {genID, rotateCoord} from "../../internal/measure";
import * as c from "../cons";
import {convertCartesianToAngle} from "../../internal/geometry";
import {ReactProps} from "../../internal/types/util";
import {resolveColor} from "../../internal/colors";
import {Pooler} from "./view";
import {cache} from "../../internal/cache";

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
    const keycapBases: Pair[][] = props.selection.map((key) => {
        const {basePathPoints} = cache.keycapShape({
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