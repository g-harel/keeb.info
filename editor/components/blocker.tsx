import React from "react";

import * as c from "../cons";
import {Shape} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";
import {Pooler} from "./view";
import {genID, joinShape} from "../../internal/measure";
import {straightPath} from "../../internal/measure/math";

export interface BlockerProps extends ReactProps {
    pooler: Pooler;
    shape: Shape[];
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
