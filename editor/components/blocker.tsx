import React from "react";

import * as c from "../cons";
import {Shape} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";
import {Pooler} from "./view";
import {straightPath} from "../../internal/svg";
import {genID} from "../../internal/util";
import {joinShape} from "../../internal/polygon";

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
