import React from "react";
import {resolveColor} from "../../internal/colors";
import {
    Polygon,
    MultiPolygon,
    union,
    intersection,
    difference,
    Geom,
} from "polygon-clipping";

import {KeysetKeycap, Pair, QuadPoint, Shape} from "../../internal/types/base";
import {Key} from "../components/key";
import {Plane, PlaneItem} from "../components/plane";
import {unionAll} from "../../internal/measure";
import {RadBridge} from "../components/rad-bridge";
import {BORDER} from "../cons";

const keys: KeysetKeycap[] = [
    {
        key: {
            shape: [{height: 1, width: 1, offset: [0, 0]}],
            stabilizers: [],
            stem: [0.5, 0.5],
        },
        shelf: [],
        profile: {profile: "0.24463679921190185", row: "R1"},
        legend: {
            frontLegends: [],
            topLegends: [
                [],
                [
                    {
                        color: "GN20",
                        text: "Esc",
                        size: 0.70001,
                    },
                ],
                [],
            ],
        },
        position: [1, 1],
        barred: false,
        scooped: false,
        stem: "Cherry",
        color: "GN21",
        keycodeAffinity: [],
    },
    {
        key: {
            shape: [
                {height: 2, width: 1.25, offset: [0.75, 0]},
                {height: 1, width: 2, offset: [0, 0]},
            ],
            stabilizers: [],
            stem: [1.25, 1],
        },
        shelf: [{height: 0.75, width: 0.75, offset: [1, 0.5]}],
        profile: {profile: "0.3359295944002527", row: "R1"},
        legend: {
            frontLegends: [],
            topLegends: [
                [],
                [
                    {
                        color: "GN20",
                        text: "Enter",
                        size: 0.70001,
                    },
                ],
                [],
            ],
        },
        position: [2, 1],
        barred: false,
        scooped: false,
        stem: "Cherry",
        color: "GR21",
        keycodeAffinity: [],
    },
    {
        key: {
            shape: [{height: 1, width: 1.75, offset: [0, 0]}],
            stabilizers: [],
            stem: [0.5, 0.5],
        },
        shelf: [
            {height: 0.75, width: 1.25, offset: [0, 0]},
            {height: 0.75, width: 1.25, offset: [0.5, 0.25]},
        ],
        profile: {profile: "0.24463679921190185", row: "R1"},
        legend: {
            frontLegends: [],
            topLegends: [
                [],
                [
                    {
                        color: "GN21",
                        text: "Caps",
                        size: 0.70001,
                    },
                ],
                [],
            ],
        },
        position: [1, 2],
        barred: false,
        scooped: false,
        stem: "Cherry",
        color: "GN20",
        keycodeAffinity: [],
    },
];

const distance = (a: Pair, b: Pair): number => {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
};

const angleBetween = (a: Pair, b: Pair, center: Pair): number => {
    const dAx = center[0] - a[0];
    const dAy = center[1] - a[1];
    const dBx = b[0] - center[0];
    const dBy = b[1] - center[1];
    return Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
};

const round = (shape: Pair[], radius: number): QuadPoint[] => {
    const points: QuadPoint[] = [];
    const safePoly = [shape[shape.length - 1], ...shape, shape[0]];
    for (let i = 1; i < safePoly.length - 1; i++) {
        const before = safePoly[i - 1];
        const current = safePoly[i];
        const after = safePoly[i + 1];

        const angle = angleBetween(before, after, current) / 2;
        const chopLength = radius / Math.cos(angle);

        let beforeFraction = chopLength / distance(before, current);
        if (beforeFraction > 0.5) beforeFraction = 0.5;
        const start: Pair = [
            before[0] + (1 - beforeFraction) * (current[0] - before[0]),
            before[1] + (1 - beforeFraction) * (current[1] - before[1]),
        ];

        let afterFraction = chopLength / distance(after, current);
        if (afterFraction > 0.5) afterFraction = 0.5;
        const end: Pair = [
            after[0] + (1 - afterFraction) * (current[0] - after[0]),
            after[1] + (1 - afterFraction) * (current[1] - after[1]),
        ];

        points.push([start, current, end]);
    }
    return points;
};

export const split = (percentage: number, a: number, b: number): number => {
    return a + percentage * (b - a);
};

export const splitLine = (percentage: number, a: Pair, b: Pair): Pair => {
    return [split(percentage, a[0], b[0]), split(percentage, a[1], b[1])];
};

const approx = (rounded: QuadPoint[], resolution: number): Pair[] => {
    const points: Pair[] = [];
    for (const point of rounded) {
        const [p0, p1, p2] = point;
        for (let p = 0; p <= 1; p += resolution) {
            points.push(
                splitLine(p, splitLine(p, p0, p1), splitLine(p, p1, p2)),
            );
        }
    }
    return points;
};

const straightPath = (points: Pair[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [start, end] = points[i];
        path += `${i === 0 ? "M" : "L"} ${start} ${end} `;
    }
    path += "Z";
    return path;
};

const roundedPath = (points: QuadPoint[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [rStart, point, rEnd] = points[i];
        path += `${i === 0 ? "M" : "L"} ${rStart[0]} ${rStart[1]} `;
        path += `Q ${point[0]} ${point[1]} ${rEnd[0]} ${rEnd[1]} `;
    }
    path += "Z";
    return path;
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

const removeConcave = (points: Pair[], ignore: Pair[]): Pair[] => {
    while (true) {
        let found = false;
        const concave: Record<number, boolean> = {};
        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            let ignorePoint = false;
            for (const ignored of ignore) {
                if (current[0] === ignored[0] && current[1] === ignored[1]) {
                    ignorePoint = true;
                    continue;
                }
            }
            if (ignorePoint) continue;
            const before = points[(i + points.length - 1) % points.length];
            const after = points[(i + 1) % points.length];
            const angle = angleBetween(before, after, current);
            if (angle < 0) {
                concave[i] = true;
                found = true;
            }
        }
        points = points.filter((_, i) => !concave[i]);
        if (!found) break;
    }
    return points;
};

const sh = (m: MultiPolygon): Pair[] => {
    if (m.length === 0) return [];
    if (m.length > 1) throw "TODO split";
    if (m[0].length > 1) throw "TODO split";
    return m[0][0].slice(1);
};

const STEP_RATIO = 0.5;
const R_SHINE = 0.05;
const R_BASE = 0.02;
const R_STEP =
    Math.min(R_BASE, R_SHINE) + Math.abs(R_BASE - R_SHINE) * STEP_RATIO;
const RES = 1 / 5;
const STROKE = 0.01;
const PAD_TOP = -0.2;
const PAD_SIDE = 0.12;
const PAD_BOTTOM = 0.38;
const STEP_PADDING: [number, number, number] = [
    PAD_TOP * STEP_RATIO,
    PAD_SIDE * STEP_RATIO,
    PAD_BOTTOM * STEP_RATIO,
];
const SHINE_PADDING: [number, number, number] = [PAD_TOP, PAD_SIDE, PAD_BOTTOM];
const DEBUG = true;

export const Demo = () => (
    <Plane pixelWidth={1200} unitSize={[10, 4]}>
        {keys.map((key, i) => {
            return (
                <PlaneItem
                    key={`key-${i}`}
                    origin={[0, 0]}
                    angle={0}
                    position={key.position}
                >
                    <Key
                        blank={key.key}
                        color={resolveColor(key.color)}
                        shelf={key.shelf}
                        legend={key.legend}
                        stem
                        stabs
                        noWire
                    />
                </PlaneItem>
            );
        })}
        {keys.map((key, i) => {
            const p: Pair = [key.position[0] + 4, key.position[1]];
            const stepped = key.shelf && key.shelf.length > 0;
            const shineShape = stepped ? key.shelf : key.key.shape;
            const debug: [string, string][] = []; // [path, color] TODO remove

            // Sharp key base.
            const rawBase = sh(unionAll(key.key.shape));

            // Shine outer edge.
            const rawStep = sh(unionAll(pad(key.key.shape, STEP_PADDING)));
            const roundStep = round(rawStep, R_STEP);
            const approxStep = approx(roundStep, RES);

            // Shine shape.
            const rawShine = sh(unionAll(pad(shineShape, SHINE_PADDING)));
            const roundShine = round(rawShine, R_SHINE);

            // Shine inner edge.
            const rawShineBase = sh(unionAll(pad(shineShape, STEP_PADDING)));
            const roundShineBase = round(rawShineBase, R_STEP);
            const approxShineBase = approx(roundShineBase, RES);

            // Rounded border around the key.
            // TODO handle intersecting shine base.
            const finalBase = removeConcave(
                sh(
                    union(
                        [approx(round(rawBase, R_BASE), RES)],
                        [approxStep],
                        [approx(round(rawShine, R_SHINE), RES)],
                        [approxShineBase],
                    ),
                ),
                rawShineBase,
            );

            const inflatePadding = STEP_PADDING.map(
                (n) => n - BORDER / 1000,
            ) as any;
            const approxInflatedShineBase = approx(
                round(sh(unionAll(pad(shineShape, inflatePadding))), R_STEP),
                RES,
            );
            const approxStepOnly = difference(
                [approxStep],
                [approxInflatedShineBase],
            )
                .flat(1)
                .map((r) => r.slice(1));

            // TODO keep track of "original point" and make rad bridge between.
            return (
                <PlaneItem key={i} origin={[0, 0]} angle={0} position={p}>
                    <path
                        d={straightPath(finalBase)}
                        stroke="lightgrey"
                        strokeWidth={STROKE}
                        fill="white"
                    />
                    {approxStepOnly.map((points, i) => (
                        <path
                            key={i}
                            d={straightPath(points)}
                            stroke="darkgrey"
                            strokeWidth={STROKE}
                            fill="white"
                        />
                    ))}
                    {/* {roundedFinalBasePoints.length <= roundShine.length &&
                        roundedFinalBasePoints.map((p, i) => (
                            <RadBridge
                                key={i}
                                quadA={p}
                                quadB={roundShine[i]}
                                color="red"
                                width={STROKE}
                                {...({} as any)}
                            />
                        ))} */}
                    <path
                        d={roundedPath(roundShine)}
                        stroke="grey"
                        strokeWidth={STROKE}
                        fill="white"
                    />
                    {DEBUG &&
                        debug.map(([side, color], i) => (
                            <path
                                key={i + 1234234234}
                                d={side}
                                stroke={color}
                                strokeWidth={STROKE / 4}
                                fill="transparent"
                                strokeOpacity="0.7"
                            />
                        ))}
                </PlaneItem>
            );
        })}
    </Plane>
);
