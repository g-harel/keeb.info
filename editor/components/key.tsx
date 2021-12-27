import color from "color";
import React from "react";

import {
    Blank,
    KeysetKeycapLegends,
    Pair,
    Shape,
    SpaceBetweenLayout,
    UUID,
} from "../../internal/types/base";
import {genID} from "../../internal/util";
import {rotateCoord} from "../../internal/math";
import * as c from "../cons";
import {ReactProps} from "../../internal/types/util";
import {resolveColor} from "../../internal/color";
import {Pooler} from "./view";
import {calcKeycap} from "../../internal/key";

export interface KeyProps extends ReactProps {
    uuid: UUID;
    color: string;
    blank: Blank;
    pooler: Pooler;
    shelf?: Shape[];
    stem?: boolean;
    stabs?: boolean;
    legend?: KeysetKeycapLegends;
    noWire?: boolean;
}

export interface StemProps extends ReactProps {
    pooler: Pooler;
    coord: Pair;
    color: string;
}

export interface MountProps extends ReactProps {
    pooler: Pooler;
    blank: Blank;
    color: string;
    offset: number;
    stem?: boolean;
    stabs?: boolean;
    noWire?: boolean;
}

export const Stem = (props: StemProps) => {
    return props.pooler(
        genID("stem", {color: props.color, position: props.coord}),
        () => (
            <>
                <line
                    x1={props.coord[0]}
                    y1={props.coord[1] - c.STEM_SIZE}
                    x2={props.coord[0]}
                    y2={props.coord[1] + c.STEM_SIZE}
                    stroke={color(props.color)
                        .darken(c.STEM_COLOR_DARKEN)
                        .hex()}
                    strokeWidth={c.STEM_WIDTH}
                    strokeLinecap="round"
                />
                <line
                    x1={props.coord[0] - c.STEM_SIZE}
                    y1={props.coord[1]}
                    x2={props.coord[0] + c.STEM_SIZE}
                    y2={props.coord[1]}
                    stroke={color(props.color)
                        .darken(c.STEM_COLOR_DARKEN)
                        .hex()}
                    strokeWidth={c.STEM_WIDTH}
                    strokeLinecap="round"
                />
            </>
        ),
    );
};

export const Mounts = (props: MountProps) => (
    <>
        {props.stem && (
            <Stem
                pooler={props.pooler}
                coord={[
                    props.blank.stem[0],
                    props.blank.stem[1] + props.offset,
                ]}
                color={props.color}
            />
        )}
        {props.stabs &&
            props.blank.stabilizers.map((stabilizer, i) => {
                const startStem = stabilizer.offset;
                const endStem = rotateCoord(
                    [startStem[0] + stabilizer.length, startStem[1]],
                    startStem,
                    stabilizer.angle,
                );
                const startWire = rotateCoord(
                    [startStem[0] + c.WIRE_OFFSET, startStem[1]],
                    startStem,
                    stabilizer.angle + c.WIRE_ANGLE,
                );
                const endWire = rotateCoord(
                    [endStem[0] + c.WIRE_OFFSET, endStem[1]],
                    endStem,
                    stabilizer.angle + 180 - c.WIRE_ANGLE,
                );
                return (
                    <g key={i}>
                        <Stem
                            pooler={props.pooler}
                            coord={[startStem[0], startStem[1] + props.offset]}
                            color={props.color}
                        />
                        <Stem
                            pooler={props.pooler}
                            coord={[endStem[0], endStem[1] + props.offset]}
                            color={props.color}
                        />
                        {!props.noWire && (
                            <line
                                x1={startWire[0]}
                                y1={startWire[1] + props.offset}
                                x2={endWire[0]}
                                y2={endWire[1] + props.offset}
                                stroke={color(props.color)
                                    .darken(c.WIRE_COLOR_DARKEN)
                                    .hex()}
                                strokeWidth={c.WIRE_WIDTH}
                                strokeLinecap="round"
                            />
                        )}
                    </g>
                );
            })}
    </>
);

interface PositionedElement<T> {
    position: Pair;
    element: T;
    anchor: "start" | "middle" | "end";
    baseline: "auto" | "middle" | "hanging";
}

export const calcLayout = <T extends any>(
    layout: SpaceBetweenLayout<T>,
    size: Pair,
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

export const Key = (props: KeyProps) => {
    const shineColor = color(props.color).lighten(c.SHINE_COLOR_DIFF).hex();
    const strokeColor = color(props.color).darken(c.STROKE_COLOR_DARKEN).hex();

    const shineShape =
        props.shelf && props.shelf.length > 0 ? props.shelf : props.blank.shape;
    const legendContainer = shineShape[0];
    const legendSpaceHeight =
        legendContainer.height -
        c.SHINE_PADDING_TOP -
        c.SHINE_PADDING_BOTTOM -
        2 * c.LEGEND_PADDING;
    const legendSpaceWidth =
        legendContainer.width - 2 * c.SHINE_PADDING_SIDE - 2 * c.LEGEND_PADDING;
    const legendOffsetX = c.SHINE_PADDING_SIDE + c.LEGEND_PADDING;
    const legendOffsetY = c.SHINE_PADDING_TOP + c.LEGEND_PADDING;

    const refID = genID("key", {
        base: props.blank.shape,
        shelf: props.shelf,
        color: props.color,
    });

    const calculatedKeycap = calcKeycap({
        base: props.blank.shape,
        shelf: props.shelf,
    });
    return (
        <g id={props.uuid}>
            {/* Keycap */}
            {props.pooler(refID, () => (
                <g>
                    <path
                        d={calculatedKeycap.basePath}
                        stroke={strokeColor}
                        strokeWidth={c.BORDER}
                        fill={props.color}
                    />
                    {calculatedKeycap.stepPaths.map((path, i) => (
                        <path
                            key={i}
                            d={path}
                            stroke={strokeColor}
                            strokeWidth={c.BORDER}
                            fill={props.color}
                            strokeLinejoin="round"
                        />
                    ))}
                    {calculatedKeycap.arcBridgeLines.map((l, i) => (
                        <line
                            key={i}
                            x1={l[0][0]}
                            y1={l[0][1]}
                            x2={l[1][0]}
                            y2={l[1][1]}
                            stroke={strokeColor}
                            strokeWidth={c.DETAIL_BORDER}
                            strokeLinecap="round"
                        />
                    ))}
                    <path
                        d={calculatedKeycap.shinePath}
                        stroke={strokeColor}
                        strokeWidth={c.BORDER}
                        fill={shineColor}
                    />
                </g>
            ))}

            {/* Mounts */}
            <Mounts
                pooler={props.pooler}
                blank={props.blank}
                offset={(c.SHINE_PADDING_TOP - c.SHINE_PADDING_BOTTOM) / 2}
                color={props.color}
                stem={props.stem}
                stabs={props.stabs}
                noWire={props.noWire}
            />

            {/* TODO front legend */}
            {/* TODO wrap legends when overflow */}
            {props.legend &&
                calcLayout(props.legend.topLegends, [
                    legendSpaceWidth,
                    legendSpaceHeight,
                ]).map((l, i) => {
                    const size = c.LEGEND_FONT_SIZE * (l.element.size || 1);
                    const backupColor = color(props.color)
                        .darken(c.STROKE_COLOR_DARKEN)
                        .hex();
                    return (
                        <text
                            key={i}
                            x={l.position[0] + legendOffsetX}
                            y={l.position[1] + legendOffsetY}
                            fontSize={size}
                            fontWeight="bold"
                            fill={resolveColor(l.element.color || backupColor)}
                            dominantBaseline={l.baseline}
                            textAnchor={l.anchor}
                        >
                            {l.element.text}
                        </text>
                    );
                })}
        </g>
    );
};
