import color from "color";
import React from "react";

import {Blank} from "../../internal/blank";
import {Box} from "../../internal/box";
import {calcKeycap} from "../../internal/keycap";
import {rotateCoord} from "../../internal/math";
import {Angle, Point, UUID} from "../../internal/primitives";
import {ReactProps} from "../../internal/react";
import {Shape} from "../../internal/shape";
import * as c from "../cons";
import {Pooler} from "./view";

export interface SelectionItem {
    blank: Blank;
    shelf?: Box[];
    position: Point;
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
    const keycapBases: Shape[] = props.selection.map((key) => {
        const {basePathPoints} = calcKeycap({
            base: key.blank.boxes,
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
