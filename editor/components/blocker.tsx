import color from "color";
import React from "react";

import {Box, toShape} from "../../internal/box";
import {toSVGPath} from "../../internal/curve";
import {genID} from "../../internal/identity";
import {ReactProps} from "../../internal/react";
import {round} from "../../internal/shape";
import * as c from "../cons";
import {Pooler} from "./view";

export interface BlockerProps extends ReactProps {
    pooler: Pooler;
    boxes: Box[];
    color: string;
}

const HATCHING_SIZE = 0.07;

export const Blocker = (props: BlockerProps) => {
    const rawBase = round(toShape(props.boxes), c.KEY_RADIUS, c.KEY_RADIUS);
    const refID = genID("blocker", {base: props.boxes, color: props.color});
    const innerColor = color(props.color).lighten(c.SHINE_COLOR_DIFF).hex();
    const strokeColor = color(props.color).darken(c.STROKE_COLOR_DARKEN).hex();
    const patternID = `${refID}-pattern`;

    return (
        <>
            <pattern
                id={patternID}
                width={HATCHING_SIZE}
                height={HATCHING_SIZE}
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
            >
                <rect
                    width={HATCHING_SIZE}
                    height={HATCHING_SIZE}
                    fill={innerColor}
                />
                <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={HATCHING_SIZE}
                    stroke={strokeColor}
                    strokeWidth={2 * c.BORDER}
                />
            </pattern>
            {props.pooler(refID, () => (
                <path
                    d={toSVGPath(rawBase)}
                    stroke={strokeColor}
                    strokeWidth={c.BORDER}
                    fill={`url(#${patternID})`}
                    strokeLinejoin="round"
                />
            ))}
        </>
    );
};
