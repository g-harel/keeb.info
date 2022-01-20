import color from "color";
import React from "react";

import {genID} from "../../identity";
import {Point} from "../../point";
import {ReactProps} from "../../react";
import {Pooler} from "../../../website/components/view";

export interface StemProps extends ReactProps {
    pooler: Pooler;
    coord: Point;
    color: string;
}

export const WIDTH = 0.03;
export const SIZE = 0.05;
export const COLOR_DARKEN = 0;

export const Stem = (props: StemProps) => {
    return props.pooler(
        genID("stem", {color: props.color, position: props.coord}),
        () => (
            <>
                <line
                    x1={props.coord[0]}
                    y1={props.coord[1] - SIZE}
                    x2={props.coord[0]}
                    y2={props.coord[1] + SIZE}
                    stroke={color(props.color).darken(COLOR_DARKEN).hex()}
                    strokeWidth={WIDTH}
                    strokeLinecap="round"
                />
                <line
                    x1={props.coord[0] - SIZE}
                    y1={props.coord[1]}
                    x2={props.coord[0] + SIZE}
                    y2={props.coord[1]}
                    stroke={color(props.color).darken(COLOR_DARKEN).hex()}
                    strokeWidth={WIDTH}
                    strokeLinecap="round"
                />
            </>
        ),
    );
};
