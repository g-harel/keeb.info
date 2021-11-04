import * as color from "color";
import React from "react";
import {MultiPolygon, union, difference} from "polygon-clipping";

import {
    Blank,
    KeysetKeycapLegends,
    Pair,
    QuadPoint,
    Shape,
    SpaceBetweenLayout,
} from "../../internal/types/base";
import {rotateCoord, unionShape} from "../../internal/measure";
import * as c from "../cons";
import {
    approx,
    round,
    roundedPath,
    convertCartesianToAngle,
    straightPath,
    bridgeArcs,
} from "../../internal/geometry";
import {ReactProps} from "../../internal/types/util";
import {resolveColor} from "../../internal/colors";
import {Pool} from "./plane";

export interface KeyProps extends ReactProps {
    color: string;
    blank: Blank;
    pool: Pool;
    shelf?: Shape[];
    stem?: boolean;
    stabs?: boolean;
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

// TODO Add to pool.
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

const multiUnion = (...shapes: Pair[][]): Pair[][] => {
    const roundFactor = 10000000; // TODO tweak if breaking.
    const roundedShapes: typeof shapes = shapes.map((shape) =>
        shape.map((pair) => [
            Math.round(pair[0] * roundFactor) / roundFactor,
            Math.round(pair[1] * roundFactor) / roundFactor,
        ]),
    );

    const mp: MultiPolygon = union([], ...roundedShapes.map((lc) => [[lc]]));
    return mp.flat(1).map((poly) => poly.slice(1));
};

const KEY_PADDING: [number, number, number] = [c.KEY_PAD, c.KEY_PAD, c.KEY_PAD];

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

interface CalculatedKeycap {
    basePath: string;
    stepPaths: string[];
    arcBridgeLines: [Pair, Pair][];
    shinePath: string;
}

const genKeyID = (blank: Blank, shelf: Shape[], color?: string): string => {
    return [...blank.shape, ...(shelf ? shelf : [])]
        .map((shape) => [shape.height, shape.width, shape.offset])
        .flat(Infinity)
        .concat((color ? [color] : []) as any)
        .join("/");
};

const keycapCache: Record<string, CalculatedKeycap> = {};
const calcKeycap = (key: KeyProps): CalculatedKeycap => {
    const id = genKeyID(key.blank, key.shelf || []);
    if (keycapCache[id] !== undefined) {
        return keycapCache[id];
    }

    const stepped = key.shelf && key.shelf.length > 0;
    const shape = pad(key.blank.shape, KEY_PADDING);
    const shineShape = pad(stepped ? key.shelf : key.blank.shape, KEY_PADDING);

    // Sharp key base.
    const rawBase = sh(unionShape(shape));
    const roundBase = round(rawBase, c.KEY_RADIUS, c.KEY_RADIUS);

    // Shine outer edge.
    const rawStep = sh(unionShape(pad(shape, STEP_PADDING)));
    const roundStep = round(rawStep, c.STEP_RADIUS, c.KEY_RADIUS);
    const approxStep = approx(roundStep, c.ROUND_RESOLUTION);

    // Shine shape.
    const rawShine = sh(unionShape(pad(shineShape, SHINE_PADDING)));
    const roundShine = round(rawShine, c.SHINE_RADIUS, c.KEY_RADIUS);

    // Shine inner edge.
    const rawShineBase = sh(unionShape(pad(shineShape, STEP_PADDING)));
    const roundShineBase = round(rawShineBase, c.STEP_RADIUS, c.KEY_RADIUS);
    const approxShineBase = approx(roundShineBase, c.ROUND_RESOLUTION);

    // Calculate corner bridge lines and shapes.
    const arcCorners: Pair[][] = [];
    const arcBridges: [Pair, Pair][] = [];
    const addArcs = (count: number, a: QuadPoint[], b: QuadPoint[]) => {
        a.forEach((p, i) => {
            const lines = bridgeArcs(count, p, b[i]);
            arcBridges.push(...lines);

            const localCorners: Pair[][] = [];
            for (let i = 0; i < lines.length - 2; i++) {
                const first = lines[i];
                const second = lines[i + 1];
                const third = lines[i + 2];
                localCorners.push([
                    first[0],
                    first[1],
                    second[1],
                    third[1],
                    third[0],
                    second[0],
                ]);
            }
            arcCorners.push(...multiUnion(...localCorners));
        });
    };
    addArcs(1 / c.ROUND_RESOLUTION, roundBase, roundStep);
    addArcs(1 / c.ROUND_RESOLUTION, roundShineBase, roundShine);

    // Combine all shapes into footprint.
    const finalBase = multiUnion(
        approx(roundBase, c.ROUND_RESOLUTION),
        approxStep,
        approx(roundShine, c.ROUND_RESOLUTION),
        approxShineBase,
        ...arcCorners,
    )[0];

    // Create step shape with the shine stamped out.
    const inflatePadding = STEP_PADDING.map((n) => n - c.BORDER / 1000) as any;
    const approxInflatedShineBase = approx(
        round(sh(unionShape(pad(shineShape, inflatePadding))), c.STEP_RADIUS, c.KEY_RADIUS),
        c.ROUND_RESOLUTION,
    );
    const approxStepOnly = difference([approxStep], [approxInflatedShineBase])
        .flat(1)
        .map((r) => r.slice(1));

    const calculatedKeycap: CalculatedKeycap = {
        basePath: straightPath(finalBase),
        stepPaths: approxStepOnly.map(straightPath),
        arcBridgeLines: arcBridges,
        shinePath: roundedPath(roundShine),
    };
    keycapCache[id] = calculatedKeycap;
    return calculatedKeycap;
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

    const refID = genKeyID(props.blank, props.shelf || [], props.color);
    if (!props.pool.hasRef(refID)) {
        const calculatedKeycap = calcKeycap(props);
        props.pool.add(
            refID,
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
                    />
                ))}
                <path
                    d={calculatedKeycap.shinePath}
                    stroke={strokeColor}
                    strokeWidth={c.BORDER}
                    fill={shineColor}
                />
            </g>,
        );
    }

    return (
        <g>
            {/* Keycap */}
            {props.pool.ref(refID)}

            {/* Mounts */}
            <Mounts
                blank={props.blank}
                offset={(c.SHINE_PADDING_TOP - c.SHINE_PADDING_BOTTOM) / 2}
                color={props.color}
                stem={props.stem}
                stabs={props.stabs}
                noWire={props.noWire}
            />

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
