import React from "react";

import {DEBUG_DISABLE_SVG_REF} from "../../website/internal/debug";
import {Point} from "../../internal/point";
import {ReactElement, ReactProps} from "../../internal/react";

export interface ViewProps extends ReactProps {
    unitSize: Point;
    pixelWidth: number;
    pool: RefPool;
    padTop: number;
}

interface ViewItemProps extends ReactProps {
    origin: Point;
    position: Point;
    angle: number;
}

// TODO move to internal
export const ROTATION_ORIGIN: Point = [0, 0];

export interface Pooler {
    (id: string, generator: () => ReactElement): ReactElement;
}

class RefPool {
    private components: ReactElement[];
    private ids: Record<string, boolean>;

    constructor() {
        this.components = [];
        this.ids = {};
    }

    add(id: string, generator: () => ReactElement): ReactElement {
        if (DEBUG_DISABLE_SVG_REF) {
            return generator();
        }
        if (!this.ids[id]) {
            this.components.push(
                <g id={id} key={id}>
                    {generator()}
                </g>,
            );
            this.ids[id] = true;
        }
        return <use xlinkHref={`#${id}`} />;
    }

    defs(): ReactElement {
        return <defs>{this.components}</defs>;
    }
}

export const createPool = (): [RefPool, Pooler] => {
    const refPool = new RefPool();
    return [refPool, refPool.add.bind(refPool)];
};

export const ViewItem = (props: ViewItemProps) => (
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

// TODO make downloadable.
export const View = (props: ViewProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox={`0 ${-props.padTop} ${props.unitSize[0]} ${
            props.unitSize[1] + props.padTop
        }`}
        width={props.pixelWidth}
        style={{fontFamily: `"Helvetica Neue",Helvetica,Arial,sans-serif`}}
    >
        {props.children}
        {props.pool.defs()}
    </svg>
);
