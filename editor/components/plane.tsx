import React from "react";

import {Pair} from "../../internal/types/base";
import {ReactElement, ReactProps} from "../../internal/types/util";

export interface PlaneProps extends ReactProps {
    unitSize: Pair;
    pixelWidth: number;
    pool: Pool;
}

interface PlaneItemProps extends ReactProps {
    origin: Pair;
    position: Pair;
    angle: number;
}

export class Pool {
    private components: ReactElement[];
    private ids: Record<string, boolean>;

    constructor() {
        this.components = [];
        this.ids = {};
    }

    hasRef(id: string): boolean {
        return !!this.ids[id];
    }

    add(id: string, component: ReactElement) {
        if (this.ids[id]) return;
        this.components.push(
            <g id={id} key={id}>
                {component}
            </g>,
        );
        this.ids[id] = true;
    }

    ref(id: string): ReactElement {
        return <use xlinkHref={`#${id}`} />;
    }

    defs(): ReactElement {
        return <defs>{this.components}</defs>;
    }
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

export const Plane = (props: PlaneProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${props.unitSize[0]} ${props.unitSize[1]}`}
        width={props.pixelWidth}
        style={{border: "1px solid red"}}
    >
        {props.children}
        {props.pool.defs()}
    </svg>
);
