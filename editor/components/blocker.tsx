import React from "react";

import * as c from "../cons";
import { joinShapes, straightPath } from "../../internal/geometry";
import {Shape} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";

export interface BlockerProps extends ReactProps {
    shape: Shape[];
    color: string;
}

export const Blocker = (props: BlockerProps) => {
    const rawBase = joinShapes(props.shape);
    return (
        <path
            d={straightPath(rawBase)}
            stroke={props.color}
            strokeWidth={c.BORDER}
            fill={props.color}
            strokeLinejoin="round"
        />
    );
};
