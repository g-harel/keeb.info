import React, {useState} from "react";
import styled from "styled-components";

import {minmax} from "../../internal/layout";
import {Coord} from "../../internal/types/base";
import {Layout, LayoutKey} from "../../internal/types/layout";
import {Key} from "./key";

export interface BoardProps {
    width: number;
    layout: Layout;
}

interface PositionProps {
    min: Coord;
    max: Coord;
    layoutKey: LayoutKey;
}

export const PositionedKey: React.FunctionComponent<PositionProps> = (
    props,
) => (
    <g
        id={props.ref}
        style={{
            transform: `rotate(${props.layoutKey.angle}deg) translate(${
                props.layoutKey.position.x - props.min.x
            }px,${props.layoutKey.position.y - props.min.y}px)`,
            transformOrigin: `${-props.min.x}px ${-props.min.y}px`,
        }}
    >
        <Key blank={props.layoutKey.key} />
    </g>
);

export const Board: React.FunctionComponent<BoardProps> = (props) => {
    const {layout, width} = props as BoardProps;
    const [min, max] = minmax(layout);
    const unitWidth = max.x - min.x;
    const unitHeight = max.y - min.y;

    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const toggleSelected = (id: number) => () => {
        setSelected(Object.assign({}, selected, {[id]: !selected[id]}));
    };

    return (
        <svg
            xmlnls="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${unitWidth} ${unitHeight}`}
            width={width}
        >
            {layout.fixedKeys.map((fixedKey, i) => (
                <PositionedKey
                    key={i}
                    layoutKey={fixedKey}
                    min={min}
                    max={max}
                />
            ))}
            {layout.variableKeys.map((section, i) =>
                section.options.map((option, j) =>
                    option.keys.map((key, k) => (
                        <PositionedKey
                            key={i}
                            layoutKey={key}
                            min={min}
                            max={max}
                        />
                    )),
                ),
            )}
        </svg>
    );
};
