import React from "react";

import * as c from "../cons";
import {joinShapes, straightPath} from "../../internal/geometry";
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
    const rawBase = joinShapes(props.shape);
    const refID = genID("blocker", {base: props.shape, color: props.color});

    if (!props.pool.hasRef(refID)) {
        props.pool.add(
            refID,
            <path
                d={straightPath(rawBase)}
                stroke={props.color}
                strokeWidth={c.BORDER}
                fill={props.color}
                strokeLinejoin="round"
            />,
        );
    }

    return <>{props.pool.ref(refID)}</>;
};
