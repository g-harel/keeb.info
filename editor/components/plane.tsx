import React from "react";

import {Pair} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";

export interface BoardProps extends ReactProps {
    unitSize: Pair;
    pixelWidth: number;
}

interface PlaneItemProps extends ReactProps {
    origin: Pair;
    position: Pair;
    angle: number;
}

export const PlaneItem = (props: PlaneItemProps) => (
    <g
        style={{
            transform:
                `rotate(${props.angle}deg) ` +
                `translate(` +
                `    ${props.position[0] - props.origin[0]}px,` +
                `    ${props.position[1] - props.origin[1]}px)`,
            transformOrigin: `${-props.origin[0]}px ${-props.origin[1]}px`,
        }}
    >
        {props.children}
    </g>
);

export const Plane = (props: BoardProps) => (
    <svg
        xmlnls="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${props.unitSize[0]} ${props.unitSize[1]}`}
        width={props.pixelWidth}
        style={{border: "1px solid red"}}
    >
        {props.children}
    </svg>
);
