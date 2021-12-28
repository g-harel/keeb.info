import React from "react";

import {Box, toSingleShape} from "../../internal/box";
import {ReactProps} from "../../internal/react";
import {toSVGPath} from "../../internal/shape";
import {genID} from "../../internal/util";
import * as c from "../cons";
import {Pooler} from "./view";

export interface BlockerProps extends ReactProps {
    pooler: Pooler;
    boxes: Box[];
    color: string;
}

export const Blocker = (props: BlockerProps) => {
    const rawBase = toSingleShape(props.boxes);
    const refID = genID("blocker", {base: props.boxes, color: props.color});

    return (
        <>
            {props.pooler(refID, () => (
                <path
                    d={toSVGPath(rawBase)}
                    stroke={props.color}
                    strokeWidth={c.BORDER}
                    fill={props.color}
                    strokeLinejoin="round"
                />
            ))}
        </>
    );
};
