import React from "react";

import {Box} from "../../internal/measure";
import {joinShape} from "../../internal/polygon";
import {ReactProps} from "../../internal/react";
import {straightPath} from "../../internal/svg";
import {genID} from "../../internal/util";
import * as c from "../cons";
import {Pooler} from "./view";

export interface BlockerProps extends ReactProps {
    pooler: Pooler;
    shape: Box[];
    color: string;
}

export const Blocker = (props: BlockerProps) => {
    const rawBase = joinShape(props.shape);
    const refID = genID("blocker", {base: props.shape, color: props.color});

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
