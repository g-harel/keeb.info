import React from "react";

import {Coord} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";

export interface BoardProps extends ReactProps {
    unitSize: Coord;
    pixelWidth: number;
}

interface PlaneItemProps extends ReactProps {
    origin: Coord;
    position: Coord;
    angle: number;
}

export const PlaneItem = (props: PlaneItemProps) => (
    <g
        style={{
            transform:
                `rotate(${props.angle}deg) ` +
                `translate(` +
                `    ${props.position.x - props.origin.x}px,` +
                `    ${props.position.y - props.origin.y}px)`,
            transformOrigin: `${-props.origin.x}px ${-props.origin.y}px`,
        }}
    >
        {props.children}
    </g>
);

export const Plane = (props: BoardProps) => (
    <svg
        xmlnls="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${props.unitSize.x} ${props.unitSize.y}`}
        width={props.pixelWidth}
    >
        {props.children}
    </svg>
);
