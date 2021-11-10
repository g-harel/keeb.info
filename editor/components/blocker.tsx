import React from "react";

import * as c from "../cons";
import {joinShape, straightPath} from "../../internal/geometry";
import {Shape} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";
import {Pool} from "./plane";
import {genID} from "../../internal/measure";

export interface BlockerProps extends ReactProps {
    pool: Pool;
    shape: Shape[];
    color: string;
}

export const Blocker = (props: BlockerProps) => {
    const rawBase = joinShape(props.shape);
    const refID = genID("blocker", {base: props.shape, color: props.color});

    return (
        <>
            {props.pool(refID, () => (
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
