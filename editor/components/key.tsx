import * as color from "color";
import React from "react";
import {MultiPolygon, union, difference} from "polygon-clipping";

import {
    Blank,
    KeysetKeycapLegends,
    Pair,
    Shape,
    SpaceBetweenLayout,
} from "../../internal/types/base";
import {rotateCoord, unionAll} from "../../internal/measure";
import {RadBridge} from "./rad-bridge";
import * as c from "../cons";
import {
    approx,
    removeConcave,
    round,
    roundedPath,
    convertCartesianToAngle,
    straightPath,
} from "../../internal/geometry";
import {ReactProps} from "../../internal/types/util";
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
    offset: number;
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
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN).hex()}
            strokeWidth={c.STEM_WIDTH}
            strokeLinecap="round"
        />
        <line
            x1={props.coord[0] - c.STEM_SIZE}
            y1={props.coord[1]}
            x2={props.coord[0] + c.STEM_SIZE}
            y2={props.coord[1]}
            stroke={color(props.color).darken(c.STEM_COLOR_DARKEN).hex()}
            strokeWidth={c.STEM_WIDTH}
            strokeLinecap="round"
        />
    </>
);

export const Mounts = (props: MountProps) => (
    <g>
        {props.stem && (
            <Stem
                coord={[
                    props.blank.stem[0],
                    props.blank.stem[1] + props.offset,
                ]}
                color={props.color}
            />
        )}
        {props.stabs &&
            props.blank.stabilizers.map((stabilizer, i) => {
                const angle = convertCartesianToAngle(stabilizer.angle);
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
                        <Stem
                            coord={[startStem[0], startStem[1] + props.offset]}
                            color={props.color}
                        />
                        <Stem
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
    </g>
);

interface PositionedElement<T> {
    position: Pair;
    element: T;
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
                return {
                    position: [cellWidth * j, rowHeight * i],
                    element: cell,
                };
            });
        })
        .flat() as PositionedElement<T>[];
};

const pad = (shapes: Shape[], padding: [number, number, number]): Shape[] => {
    return shapes.map((box) => ({
        width: box.width - 2 * padding[1],
        height: box.height - padding[0] - padding[2],
        offset: [
            box.offset[0] + padding[1],
            box.offset[1] + padding[0],
        ] as Pair,
    }));
};

const sh = (m: MultiPolygon): Pair[] => {
    if (m.length === 0) return [];
    if (m.length > 1) throw "TODO split";
    if (m[0].length > 1) throw "TODO split";
    return m[0][0].slice(1);
};

const STEP_PADDING: [number, number, number] = [
    c.SHINE_PADDING_TOP * c.STEP_RATIO,
    c.SHINE_PADDING_SIDE * c.STEP_RATIO,
    c.SHINE_PADDING_BOTTOM * c.STEP_RATIO,
];
const SHINE_PADDING: [number, number, number] = [
    c.SHINE_PADDING_TOP,
    c.SHINE_PADDING_SIDE,
    c.SHINE_PADDING_BOTTOM,
];

export const Key = (props: KeyProps) => {
    const stepped = props.shelf && props.shelf.length > 0;
    const shineShape = stepped ? props.shelf : props.blank.shape;
    const debug: [string, string][] = []; // [path, color] TODO remove

    // Sharp key base.
    const rawBase = sh(unionAll(props.blank.shape));
    const roundBase = round(rawBase, c.KEY_RADIUS);

    // Shine outer edge.
    const rawStep = sh(unionAll(pad(props.blank.shape, STEP_PADDING)));
    const roundStep = round(rawStep, c.STEP_RADIUS);
    const approxStep = approx(roundStep, c.ROUND_RESOLUTION);

    // Shine shape.
    const rawShine = sh(unionAll(pad(shineShape, SHINE_PADDING)));
    const roundShine = round(rawShine, c.SHINE_RADIUS);

    // Shine inner edge.
    const rawShineBase = sh(unionAll(pad(shineShape, STEP_PADDING)));
    const roundShineBase = round(rawShineBase, c.STEP_RADIUS);
    const approxShineBase = approx(roundShineBase, c.ROUND_RESOLUTION);

    // Rounded border around the key.
    // TODO handle intersecting shine base.
    const finalBase = removeConcave(
        sh(
            union(
                [approx(roundBase, c.ROUND_RESOLUTION)],
                [approxStep],
                [approx(roundShine, c.ROUND_RESOLUTION)],
                [approxShineBase],
            ),
        ),
        rawShineBase,
    );

    const inflatePadding = STEP_PADDING.map((n) => n - c.BORDER / 1000) as any;
    const approxInflatedShineBase = approx(
        round(sh(unionAll(pad(shineShape, inflatePadding))), c.STEP_RADIUS),
        c.ROUND_RESOLUTION,
    );
    const approxStepOnly = difference([approxStep], [approxInflatedShineBase])
        .flat(1)
        .map((r) => r.slice(1));

    const shineColor = color(props.color).lighten(c.SHINE_COLOR_DIFF).hex();
    const strokeColor = color(props.color).darken(c.STROKE_COLOR_DARKEN).hex();

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

    return (
        <g>
            <path
                d={straightPath(finalBase)}
                stroke={strokeColor}
                strokeWidth={c.BORDER}
                fill={props.color}
            />
            {roundBase.map((p, i) => (
                <RadBridge
                    key={i}
                    quadA={p}
                    quadB={roundStep[i]}
                    color={strokeColor}
                    width={c.BORDER / 1.2}
                    sideCount={1 / c.ROUND_RESOLUTION}
                />
            ))}
            {approxStepOnly.map((points, i) => (
                <path
                    key={i}
                    d={straightPath(points)}
                    stroke={strokeColor}
                    strokeWidth={c.BORDER}
                    fill={props.color}
                />
            ))}
            {roundShineBase.map((p, i) => (
                <RadBridge
                    key={i}
                    quadA={p}
                    quadB={roundShine[i]}
                    color={strokeColor}
                    width={c.BORDER / 1.2}
                    sideCount={1 / c.ROUND_RESOLUTION}
                />
            ))}
            <path
                d={roundedPath(roundShine)}
                stroke={strokeColor}
                strokeWidth={c.BORDER}
                fill={shineColor}
            />
            {c.DEBUG &&
                debug.map(([side, color], i) => (
                    <path
                        key={i + 1234234234}
                        d={side}
                        stroke={color}
                        strokeWidth={c.BORDER / 4}
                        fill="transparent"
                        strokeOpacity="0.7"
                    />
                ))}
            {!props.notKey && (
                <Mounts
                    blank={props.blank}
                    offset={(c.SHINE_PADDING_TOP - c.SHINE_PADDING_BOTTOM) / 2}
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
