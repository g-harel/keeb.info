import React from "react";
import styled from "styled-components";
import * as color from "color";

import {rotateCoord} from "../../internal/measure";
import {
    Blank,
    KeysetKeycapLegend,
    KeysetKeycapLegends,
    Pair,
    Shape,
    SpaceBetweenLayout,
} from "../../internal/types/base";
import * as c from "../cons";
import {ReactProps} from "../../internal/types/util";
import {StrokeShape} from "./stroke-shape";
import {convertCartesiantToAngle} from "../../internal/convert";
import {resolveColor} from "../../internal/colors";

export interface KeyProps extends ReactProps {
    color: string;
    blank: Blank;
    shelf?: Shape[];
    stem?: boolean;
    stabs?: boolean;
    notKey?: boolean;
    legend?: KeysetKeycapLegends;
    noWire?: boolean;
}

export interface StemProps extends ReactProps {
    coord: Pair;
    color: string;
}

export interface MountProps extends ReactProps {
    blank: Blank;
    color: string;
    stem?: boolean;
    stabs?: boolean;
    noWire?: boolean;
}

export const Stem = (props: StemProps) => (
    <>
        <line
            x1={props.coord[0]}
            y1={props.coord[1] - c.STEM_SIZE}
            x2={props.coord[0]}
            y2={props.coord[1] + c.STEM_SIZE}
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN)}
            strokeWidth={c.STEM_WIDTH}
            strokeLinecap="round"
        />
        <line
            x1={props.coord[0] - c.STEM_SIZE}
            y1={props.coord[1]}
            x2={props.coord[0] + c.STEM_SIZE}
            y2={props.coord[1]}
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN)}
            strokeWidth={c.STEM_WIDTH}
            strokeLinecap="round"
        />
    </>
);

export const Mounts = (props: MountProps) => (
    <g>
        {props.stem && <Stem coord={props.blank.stem} color={props.color} />}
        {props.stabs &&
            props.blank.stabilizers.map((stabilizer, i) => {
                const angle = convertCartesiantToAngle(stabilizer.angle);
                const startStem = stabilizer.offset;
                const endStem = rotateCoord(
                    [startStem[0] + stabilizer.length, startStem[1]],
                    startStem,
                    angle,
                );
                const startWire = rotateCoord(
                    [startStem[0] + c.WIRE_OFFSET, startStem[1]],
                    startStem,
                    angle + c.WIRE_ANGLE,
                );
                const endWire = rotateCoord(
                    [endStem[0] + c.WIRE_OFFSET, endStem[1]],
                    endStem,
                    angle + 180 - c.WIRE_ANGLE,
                );
                return (
                    <g key={i}>
                        <Stem coord={startStem} color={props.color} />
                        <Stem coord={endStem} color={props.color} />
                        {!props.noWire && (
                            <line
                                x1={startWire[0]}
                                y1={startWire[1]}
                                x2={endWire[0]}
                                y2={endWire[1]}
                                stroke={color(props.color).darken(
                                    c.WIRE_COLOR_DARKEN,
                                )}
                                strokeWidth={c.WIRE_WIDTH}
                                strokeLinecap="round"
                            />
                        )}
                    </g>
                );
            })}
    </g>
);

interface PositionnedElement<T> {
    position: Pair;
    element: T;
}

export const calcLayout = <T extends any>(
    layout: SpaceBetweenLayout<T>,
    size: Pair,
): PositionnedElement<T>[] => {
    const rowHeight = size[1] / layout.length;
    return layout
        .map((row, i) => {
            const cellWidth = size[0] / row.length;
            return row.map((cell, j) => {
                return {
                    position: [cellWidth * j, rowHeight * i],
                    element: cell,
                };
            });
        })
        .flat() as PositionnedElement<T>[];
};

export const Key = (props: KeyProps) => {
    let shineShape = props.blank.shape;
    if (props.shelf && props.shelf.length > 0) {
        shineShape = props.shelf;
    }
    const shineColor = color(props.color).lighten(c.SHINE_COLOR_DIFF).hex();

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

    const strokeColor = color(props.color).darken(c.STROKE_COLOR_DARKEN).hex();

    // TODO match up corners in composite shapes.
    const heightish = props.blank.shape[0].height;
    const widthish = props.blank.shape[0].width;

    return (
        <g>
            {/* Cap */}
            <StrokeShape
                borderWidth={c.BORDER}
                fillColor={props.notKey ? shineColor : props.color}
                padding={[c.PAD, c.PAD, c.PAD, c.PAD]}
                radius={c.KEY_RADIUS}
                shape={props.blank.shape}
                strokeColor={strokeColor}
            />
            {/* Shine */}
            {!props.notKey && (
                <>
                    {/* Top-left */}
                    <line
                        x1={c.KEY_RADIUS * c.ARC_OFFSET + c.PAD + c.BORDER / 3}
                        y1={c.KEY_RADIUS * c.ARC_OFFSET + c.PAD + c.BORDER / 3}
                        x2={
                            c.SHINE_PADDING_SIDE +
                            c.SHINE_RADIUS * c.ARC_OFFSET +
                            c.BORDER / 3
                        }
                        y2={
                            c.SHINE_PADDING_TOP +
                            c.SHINE_RADIUS * c.ARC_OFFSET +
                            c.BORDER / 3
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={c.KEY_RADIUS + c.PAD + c.BORDER / 3}
                        y1={c.PAD + c.BORDER / 3}
                        x2={
                            c.SHINE_PADDING_SIDE + c.SHINE_RADIUS + c.BORDER / 3
                        }
                        y2={c.SHINE_PADDING_TOP + c.BORDER / 3}
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={c.PAD + c.BORDER / 3}
                        y1={c.KEY_RADIUS + c.PAD + c.BORDER / 3}
                        x2={c.SHINE_PADDING_SIDE + c.BORDER / 3}
                        y2={c.SHINE_PADDING_TOP + c.SHINE_RADIUS + c.BORDER / 3}
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />

                    {/* Bottom-left */}
                    <line
                        x1={c.KEY_RADIUS * c.ARC_OFFSET + c.PAD + c.BORDER / 3}
                        y1={
                            heightish -
                            c.PAD -
                            (c.KEY_RADIUS * c.ARC_OFFSET + c.PAD - c.BORDER / 3)
                        }
                        x2={
                            c.SHINE_PADDING_SIDE +
                            c.SHINE_RADIUS * c.ARC_OFFSET +
                            c.BORDER / 3
                        }
                        y2={
                            heightish -
                            c.PAD -
                            (c.SHINE_PADDING_BOTTOM +
                                c.SHINE_RADIUS * c.ARC_OFFSET -
                                c.BORDER / 3)
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={c.PAD + c.BORDER / 3}
                        y1={
                            heightish -
                            c.PAD -
                            (c.KEY_RADIUS + c.PAD - c.BORDER / 3)
                        }
                        x2={c.SHINE_PADDING_SIDE + c.BORDER / 3}
                        y2={
                            heightish -
                            c.PAD -
                            (c.SHINE_PADDING_BOTTOM +
                                c.SHINE_RADIUS -
                                c.BORDER / 3)
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={c.KEY_RADIUS + c.PAD + c.BORDER / 3}
                        y1={heightish - c.PAD - (c.PAD - c.BORDER / 3)}
                        x2={
                            c.SHINE_PADDING_SIDE + c.SHINE_RADIUS + c.BORDER / 3
                        }
                        y2={
                            heightish -
                            c.PAD -
                            (c.SHINE_PADDING_BOTTOM - c.BORDER / 3)
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />

                    {/* Top-right */}
                    <line
                        x1={
                            widthish -
                            c.PAD -
                            (c.KEY_RADIUS * c.ARC_OFFSET + c.PAD - c.BORDER / 3)
                        }
                        y1={c.KEY_RADIUS * c.ARC_OFFSET + c.PAD + c.BORDER / 3}
                        x2={
                            widthish -
                            c.PAD -
                            (c.SHINE_PADDING_SIDE +
                                c.SHINE_RADIUS * c.ARC_OFFSET -
                                c.BORDER / 3)
                        }
                        y2={
                            c.SHINE_PADDING_TOP +
                            c.SHINE_RADIUS * c.ARC_OFFSET +
                            c.BORDER / 3
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={
                            widthish -
                            c.PAD -
                            (c.KEY_RADIUS + c.PAD - c.BORDER / 3)
                        }
                        y1={c.PAD + c.BORDER / 3}
                        x2={
                            widthish -
                            c.PAD -
                            (c.SHINE_PADDING_SIDE +
                                c.SHINE_RADIUS -
                                c.BORDER / 3)
                        }
                        y2={c.SHINE_PADDING_TOP + c.BORDER / 3}
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={widthish - c.PAD - (c.PAD - c.BORDER / 3)}
                        y1={c.KEY_RADIUS + c.PAD + c.BORDER / 3}
                        x2={
                            widthish -
                            c.PAD -
                            (c.SHINE_PADDING_SIDE - c.BORDER / 3)
                        }
                        y2={c.SHINE_PADDING_TOP + c.SHINE_RADIUS + c.BORDER / 3}
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />

                    {/* Bottom-right */}
                    <line
                        x1={
                            widthish -
                            c.PAD -
                            (c.KEY_RADIUS * c.ARC_OFFSET + c.PAD - c.BORDER / 3)
                        }
                        y1={
                            heightish -
                            c.PAD -
                            (c.KEY_RADIUS * c.ARC_OFFSET + c.PAD - c.BORDER / 3)
                        }
                        x2={
                            widthish -
                            c.PAD -
                            (c.SHINE_PADDING_SIDE +
                                c.SHINE_RADIUS * c.ARC_OFFSET -
                                c.BORDER / 3)
                        }
                        y2={
                            heightish -
                            c.PAD -
                            (c.SHINE_PADDING_BOTTOM +
                                c.SHINE_RADIUS * c.ARC_OFFSET -
                                c.BORDER / 3)
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={widthish - c.PAD - (c.PAD - c.BORDER / 3)}
                        y1={
                            heightish -
                            c.PAD -
                            (c.KEY_RADIUS + c.PAD - c.BORDER / 3)
                        }
                        x2={
                            widthish -
                            c.PAD -
                            (c.SHINE_PADDING_SIDE - c.BORDER / 3)
                        }
                        y2={
                            heightish -
                            c.PAD -
                            (c.SHINE_PADDING_BOTTOM +
                                c.SHINE_RADIUS -
                                c.BORDER / 3)
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />
                    <line
                        x1={
                            widthish -
                            c.PAD -
                            (c.KEY_RADIUS + c.PAD - c.BORDER / 3)
                        }
                        y1={heightish - c.PAD - (c.PAD - c.BORDER / 3)}
                        x2={
                            widthish -
                            c.PAD -
                            (c.SHINE_PADDING_SIDE +
                                c.SHINE_RADIUS -
                                c.BORDER / 3)
                        }
                        y2={
                            heightish -
                            c.PAD -
                            (c.SHINE_PADDING_BOTTOM - c.BORDER / 3)
                        }
                        stroke={strokeColor}
                        stroke-width={c.BORDER}
                    />

                    <StrokeShape
                        borderWidth={c.BORDER}
                        fillColor={shineColor}
                        padding={[
                            c.SHINE_PADDING_TOP,
                            c.SHINE_PADDING_SIDE,
                            c.SHINE_PADDING_BOTTOM,
                            c.SHINE_PADDING_SIDE,
                        ]}
                        radius={c.SHINE_RADIUS}
                        shape={shineShape}
                        strokeColor={strokeColor}
                    />
                </>
            )}
            {!props.notKey && (
                <Mounts
                    blank={props.blank}
                    color={props.color}
                    stem={props.stem}
                    stabs={props.stabs}
                    noWire={props.noWire}
                />
            )}
            {props.legend &&
                calcLayout(props.legend.topLegends, [
                    legendSpaceWidth,
                    legendSpaceHeight,
                ]).map((l) => {
                    const size = c.LEGEND_FONT_SIZE * (l.element.size || 1);
                    const backupColor = color(props.color)
                        .darken(c.STROKE_COLOR_DARKEN)
                        .hex();
                    return (
                        <text
                            x={l.position[0] + legendOffsetX}
                            y={l.position[1] + legendOffsetY}
                            fontSize={size}
                            fontWeight="bold"
                            fill={resolveColor(l.element.color || backupColor)}
                            dominant-baseline="hanging"
                        >
                            {l.element.text}
                        </text>
                    );
                })}
        </g>
    );
};
