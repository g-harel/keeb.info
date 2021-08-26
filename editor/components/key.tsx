import * as color from "color";
import React from "react";
import {resolveColor} from "../../internal/colors";
import {convertCartesiantToAngle} from "../../internal/convert";
import {rotateCoord} from "../../internal/measure";
import {
    Blank,
    KeysetKeycapLegends,
    Pair,
    Shape,
    SpaceBetweenLayout,
} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";
import * as c from "../cons";
import {StrokeShape} from "./stroke-shape";

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

interface RadBridgeProps {
    color: string;
    width: number;
    a: Pair;
    b: Pair;
    aRadius: number;
    bRadius: number;
    direction: [boolean, boolean];
}

export const RadBridge = (props: RadBridgeProps) => {
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
    // TODO half-shelf in stepped keys.
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
                    <RadBridge
                        a={[c.PAD, c.PAD]}
                        aRadius={c.KEY_RADIUS}
                        b={[c.SHINE_PADDING_SIDE, c.SHINE_PADDING_TOP]}
                        bRadius={c.SHINE_RADIUS}
                        color={strokeColor}
                        width={c.BORDER}
                        direction={[true, true]}
                    />
                    <RadBridge
                        a={[widthish - c.PAD, c.PAD]}
                        aRadius={c.KEY_RADIUS}
                        b={[
                            widthish - c.SHINE_PADDING_SIDE,
                            c.SHINE_PADDING_TOP,
                        ]}
                        bRadius={c.SHINE_RADIUS}
                        color={strokeColor}
                        width={c.BORDER}
                        direction={[false, true]}
                    />
                    <RadBridge
                        a={[widthish - c.PAD, heightish - c.PAD]}
                        aRadius={c.KEY_RADIUS}
                        b={[
                            widthish - c.SHINE_PADDING_SIDE,
                            heightish - c.SHINE_PADDING_BOTTOM,
                        ]}
                        bRadius={c.SHINE_RADIUS}
                        color={strokeColor}
                        width={c.BORDER}
                        direction={[false, false]}
                    />
                    <RadBridge
                        a={[c.PAD, heightish - c.PAD]}
                        aRadius={c.KEY_RADIUS}
                        b={[
                            c.SHINE_PADDING_SIDE,
                            heightish - c.SHINE_PADDING_BOTTOM,
                        ]}
                        bRadius={c.SHINE_RADIUS}
                        color={strokeColor}
                        width={c.BORDER}
                        direction={[true, false]}
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
                            dominantBaseline="hanging"
                        >
                            {l.element.text}
                        </text>
                    );
                })}
        </g>
    );
};
