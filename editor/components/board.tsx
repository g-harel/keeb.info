import React, {useState} from "react";
import styled from "styled-components";
import * as color from "color";

import {minmax, spreadSections} from "../../internal/layout";
import {Coord} from "../../internal/types/base";
import {Layout, LayoutKey} from "../../internal/types/layout";
import {Key} from "./key";
import {START_SECTION_COLOR} from "../cons";
import {ReactProps} from "../../internal/types/util";

export interface BoardProps extends ReactProps {
    width: number;
    layout: Layout;
}

interface PositionProps extends ReactProps {
    min: Coord;
    max: Coord;
    layoutKey: LayoutKey;
    color: string;
}

export const PositionedKey = (props: PositionProps) => (
    <g
        id={props.layoutKey.ref}
        style={{
            transform: `rotate(${props.layoutKey.angle}deg) translate(${
                props.layoutKey.position.x - props.min.x
            }px,${props.layoutKey.position.y - props.min.y}px)`,
            transformOrigin: `${-props.min.x}px ${-props.min.y}px`,
        }}
    >
        <Key
            blank={props.layoutKey.key}
            color={props.color}
            shelf={(props.layoutKey as any).shelf || []}
        />
    </g>
);

export const Board = (props: BoardProps) => {
    const {layout, width} = props as BoardProps;

    console.time("spread");
    const spreadLayout = spreadSections(layout);
    console.timeEnd("spread");

    const [min, max] = minmax(spreadLayout);
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
            {spreadLayout.fixedKeys.map((key, i) => (
                <PositionedKey
                    key={key.ref}
                    layoutKey={key}
                    color="#cccccc"
                    min={min}
                    max={max}
                />
            ))}
            {spreadLayout.variableKeys.map((section, i, sections) =>
                section.options.map((option, j) =>
                    option.keys.map((key, k) => (
                        <PositionedKey
                            key={key.ref}
                            layoutKey={key}
                            color={color(START_SECTION_COLOR)
                                .rotate((i / sections.length) * 360)
                                .hex()}
                            min={min}
                            max={max}
                        />
                    )),
                ),
            )}
        </svg>
    );
};
