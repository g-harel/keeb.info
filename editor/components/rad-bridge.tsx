import React from "react";
import {splitQuadCurve} from "../../internal/geometry";

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
    if (
        props.quadA[0] === props.quadB[0] &&
        props.quadA[1] === props.quadB[1] &&
        props.quadA[2] === props.quadB[2]
    ) {
        return <></>;
    }
    if (props.sideCount === 0) {
        return <></>;
    }

    const A = props.quadA;
    const B = props.quadB;
    const lines: [Pair, Pair][] = [];
    for (let i = 0; i <= props.sideCount; i++) {
        const percentage = i / props.sideCount;
        lines.push([
            splitQuadCurve(A, percentage),
            splitQuadCurve(B, percentage),
        ]);
    }
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
