import React from "react";

import {Box, pad} from "../../box";
import {HexColor, resolveColor} from "../../color";
import {KeysetKeycapLegend, SpaceBetweenLayout} from "../../keyset";
import {Point} from "../../point";
import {Pooler} from "../../../website/components/view";

interface LegendProps {
    pooler: Pooler; // Not used, the legends don't repeat enough for caching.
    layout: SpaceBetweenLayout<KeysetKeycapLegend>;
    container: Box;
    backupColor: HexColor;
}

interface PositionedElement<T> {
    position: Point;
    element: T;
    anchor: "start" | "middle" | "end";
    baseline: "auto" | "middle" | "hanging";
}

const FONT_SIZE = 0.28;
const PADDING = 0.08;

export const calcLayout = <T extends any>(
    layout: SpaceBetweenLayout<T>,
    size: Point,
): PositionedElement<T>[] => {
    const rowHeight = size[1] / layout.length;
    return layout
        .map((row, i) => {
            const cellWidth = size[0] / row.length;
            return row.map((cell, j) => {
                const cFirst = i === 0;
                const cLast = !cFirst && i === layout.length - 1;
                const cMiddle = !cFirst && !cLast;
                const rFirst = j === 0;
                const rLast = !rFirst && j === row.length - 1;
                const rMiddle = !rFirst && !rLast;
                return {
                    position: [
                        cellWidth * j +
                            (rMiddle ? cellWidth / 2 : rLast ? cellWidth : 0),
                        rowHeight * i +
                            (cMiddle ? rowHeight / 2 : cLast ? rowHeight : 0),
                    ],
                    element: cell,
                    anchor: rFirst ? "start" : rLast ? "end" : "middle",
                    baseline: cFirst ? "hanging" : cLast ? "auto" : "middle",
                };
            });
        })
        .flat() as PositionedElement<T>[];
};

export const Legends = (props: LegendProps) => {
    const container = pad(props.container, -PADDING);
    return (
        <>
            {/* TODO wrap legends when overflow */}
            {calcLayout(props.layout, [container.width, container.height]).map(
                (l, i) => {
                    if (l.element.text === "") return null;
                    const size = FONT_SIZE * (l.element.size || 1);
                    return (
                        <text
                            key={i}
                            x={l.position[0] + container.offset[0]}
                            y={l.position[1] + container.offset[1]}
                            fontSize={size}
                            fontWeight="bold"
                            fill={resolveColor(
                                l.element.color || props.backupColor,
                            )}
                            dominantBaseline={l.baseline}
                            textAnchor={l.anchor}
                        >
                            {l.element.text}
                        </text>
                    );
                },
            )}
        </>
    );
};
