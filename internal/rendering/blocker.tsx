import color from "color";
import React from "react";

import {Box, toShape} from "../box";
import {toSVGPath} from "../curve";
import {genID} from "../identity";
import {BORDER, KEY_RADIUS} from "../keycap";
import {isErr} from "../possible";
import {ReactProps} from "../react";
import {round} from "../shape";
import {keyColor} from "./color";
import {Pooler} from "./view";

export interface BlockerProps extends ReactProps {
    pooler: Pooler;
    boxes: Box[];
    color: string;
}

const HATCHING_SIZE = 0.07;

export const Blocker = (props: BlockerProps) => {
    const rawBase = toShape(props.boxes);
    if (isErr(rawBase)) {
        // TODO centralize error reporting.
        console.warn(rawBase.err.print());
        return;
    }
    const roundedBase = round(rawBase, KEY_RADIUS, KEY_RADIUS);
    const refID = genID("blocker", {base: props.boxes, color: props.color});
    const [innerColor, strokeColor] = keyColor(props.color);
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
                    strokeWidth={2 * BORDER}
                />
            </pattern>
            {props.pooler(refID, () => (
                <path
                    d={toSVGPath(roundedBase)}
                    stroke={strokeColor}
                    strokeWidth={BORDER}
                    fill={`url(#${patternID})`}
                    strokeLinejoin="round"
                />
            ))}
        </>
    );
};
