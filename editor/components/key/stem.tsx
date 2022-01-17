import color from "color";
import React from "react";

import {genID} from "../../../internal/identity";
import {Point} from "../../../internal/point";
import {ReactProps} from "../../../internal/react";
import * as c from "../../cons";
import {Pooler} from "../view";

export interface StemProps extends ReactProps {
    pooler: Pooler;
    coord: Point;
    color: string;
}

export const Stem = (props: StemProps) => {
    return props.pooler(
        genID("stem", {color: props.color, position: props.coord}),
        () => (
            <>
                <line
                    x1={props.coord[0]}
                    y1={props.coord[1] - c.STEM_SIZE}
                    x2={props.coord[0]}
                    y2={props.coord[1] + c.STEM_SIZE}
                    stroke={color(props.color)
                        .darken(c.STEM_COLOR_DARKEN)
                        .hex()}
                    strokeWidth={c.STEM_WIDTH}
                    strokeLinecap="round"
                />
                <line
                    x1={props.coord[0] - c.STEM_SIZE}
                    y1={props.coord[1]}
                    x2={props.coord[0] + c.STEM_SIZE}
                    y2={props.coord[1]}
                    stroke={color(props.color)
                        .darken(c.STEM_COLOR_DARKEN)
                        .hex()}
                    strokeWidth={c.STEM_WIDTH}
                    strokeLinecap="round"
                />
            </>
        ),
    );
};
