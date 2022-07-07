import color from "color";
import {isErr} from "possible-ts";
import React from "react";

import {Blank} from "../blank";
import {Box} from "../box";
import {UUID} from "../identity";
import {calcKeycap} from "../keycap";
import {rotateCoord} from "../point";
import {Angle, Point} from "../point";
import {ReactProps} from "../react";
import {Shape} from "../shape";
import {Pooler, ROTATION_ORIGIN} from "./view";

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
        const keycap = calcKeycap({
            base: key.blank.boxes,
            shelf: key.shelf,
        });
        if (isErr(keycap)) {
            console.warn(keycap.err.print());
            // TODO centralize errors.
            return;
        }
        return keycap.basePathPoints.map((point) => {
            return rotateCoord(
                [point[0] + key.position[0], point[1] + key.position[1]],
                ROTATION_ORIGIN,
                key.angle,
            );
        });
    });
    return <g id={props.uuid}></g>;
};
