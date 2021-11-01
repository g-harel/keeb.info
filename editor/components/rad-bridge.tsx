import React from "react";
import {bridgeArcs, splitQuadCurve} from "../../internal/geometry";

import {Pair, QuadPoint} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";

interface RadBridgeProps extends ReactProps {
    color: string;
    width: number;
    quadA: QuadPoint;
    quadB: QuadPoint;
    sideCount: number;
}

// TODO make geometry util and move rendering into key.
export const RadBridge = (props: RadBridgeProps) => {
    const lines = bridgeArcs(props.sideCount, props.quadA, props.quadB);
    return (
        <>
            {lines.map((l, i) => (
                <line
                    key={i}
                    x1={l[0][0]}
                    y1={l[0][1]}
                    x2={l[1][0]}
                    y2={l[1][1]}
                    stroke={props.color}
                    strokeWidth={props.width / 1.4}
                />
            ))}
        </>
    );
};
