import React from "react";

import {Pair, QuadPoint} from "../../internal/types/base";
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

    quadA?: QuadPoint;
    quadB?: QuadPoint;
    sideCount?: number;
}

// TODO consolidate with utils in demo component.
export const split = (percentage: number, a: number, b: number): number => {
    return a + percentage * (b - a);
};
export const splitLine = (percentage: number, a: Pair, b: Pair): Pair => {
    return [split(percentage, a[0], b[0]), split(percentage, a[1], b[1])];
};
const roundedPath = (points: QuadPoint[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [rStart, point, rEnd] = points[i];
        path += `${i === 0 ? "M" : "L"} ${rStart[0]} ${rStart[1]} `;
        path += `Q ${point[0]} ${point[1]} ${rEnd[0]} ${rEnd[1]} `;
    }
    // path += "Z";
    return path;
};

const splitQuadCurve = (point: QuadPoint, percentage: number): Pair => {
    const [p0, p1, p2] = point;
    return splitLine(
        percentage,
        splitLine(percentage, p0, p1),
        splitLine(percentage, p1, p2),
    );
};

export const RadBridge = (props: RadBridgeProps) => {
    if (props.quadA && props.quadB) {
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
    }

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
