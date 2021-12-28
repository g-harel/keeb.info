import React from "react";

import {Box} from "../../internal/measure";
import {toSingleShape} from "../../internal/polygon";
import {ReactProps} from "../../internal/react";
import {straightPath} from "../../internal/svg";
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
                    d={straightPath(rawBase)}
                    stroke={props.color}
                    strokeWidth={c.BORDER}
                    fill={props.color}
                    strokeLinejoin="round"
                />
            ))}
        </>
    );
};
