import * as color from "color";
import React from "react";

import {Pair} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";
import * as c from "../cons";

interface RadBridgeProps extends ReactProps {
    color: string;
    width: number;
    a: Pair;
    b: Pair;
    aRadius: number;
    bRadius: number;
    direction: [boolean, boolean];
}

export const RadBridge = (props: RadBridgeProps) => {
    const up = props.direction[0] ? 1 : -1;
    const right = props.direction[1] ? 1 : -1;
    return (
        <>
            <line
                x1={
                    up * (props.aRadius * c.ARC_OFFSET + c.BORDER / 2) +
                    props.a[0]
                }
                y1={
                    right * (props.aRadius * c.ARC_OFFSET + c.BORDER / 2) +
                    props.a[1]
                }
                x2={
                    up * (props.bRadius * c.ARC_OFFSET + c.BORDER / 2) +
                    props.b[0]
                }
                y2={
                    right * (props.bRadius * c.ARC_OFFSET + c.BORDER / 2) +
                    props.b[1]
                }
                stroke={props.color}
                strokeWidth={props.width}
            />
            <line
                x1={up * (c.BORDER / 2) + props.a[0]}
                y1={right * (props.aRadius + c.BORDER / 2) + props.a[1]}
                x2={up * (c.BORDER / 2) + props.b[0]}
                y2={right * (props.bRadius + c.BORDER / 2) + props.b[1]}
                stroke={props.color}
                strokeWidth={props.width / 1.4}
            />
            <line
                x1={up * (props.aRadius + c.BORDER / 2) + props.a[0]}
                y1={right * (c.BORDER / 2) + props.a[1]}
                x2={up * (props.bRadius + c.BORDER / 2) + props.b[0]}
                y2={right * (c.BORDER / 2) + props.b[1]}
                stroke={props.color}
                strokeWidth={props.width / 1.4}
            />
        </>
    );
};
