import React from "react";
import {resolveColor} from "../../internal/colors";
import {
    Polygon,
    MultiPolygon,
    union,
    intersection,
    xor,
    Geom,
    difference,
} from "polygon-clipping";

import {KeysetKeycap, Pair, QuadPoint, Shape} from "../../internal/types/base";
import {Key} from "../components/key";
import {Plane, PlaneItem} from "../components/plane";
import {unionAll} from "../../internal/measure";
import {RadBridge} from "../components/rad-bridge";

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

const calcRoundPoints = (shape: Pair[], radius: number): QuadPoint[] => {
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

const approximate = (rounded: QuadPoint[], resolution: number): Pair[] => {
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

const removeConcave = (points: Pair[]): Pair[] => {
    while (true) {
        let found = false;
        const concave: Record<number, boolean> = {};
        for (let i = 0; i < points.length; i++) {
            const current = points[i];
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
    if (m.length > 1) throw "TODO split";
    if (m[0].length > 1) throw "TODO split";
    return m[0][0].slice(1);
};

const SHINE_RADIUS = 0.05;
const BASE_RADIUS = 0.02;
const STEP_RATIO = 0.6;
const STEP_RADIUS =
    Math.min(BASE_RADIUS, SHINE_RADIUS) +
    Math.abs(BASE_RADIUS - SHINE_RADIUS) * STEP_RATIO;
const STEP_RESOLUTION = 1 / 10;
const STROKE = 0.01;
const PAD_TOP = -3 * STROKE;
const PAD_SIDE = 0.12;
const PAD_BOTTOM = 2 * PAD_SIDE - PAD_TOP; // Keep shine square.
const STEP_PADDING: [number, number, number] = [
    PAD_TOP * STEP_RATIO,
    PAD_SIDE * STEP_RATIO,
    PAD_BOTTOM * STEP_RATIO,
];
const SHINE_PADDING: [number, number, number] = [PAD_TOP, PAD_SIDE, PAD_BOTTOM];

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

            // Sharp shine shape.
            const rawShine = sh(unionAll(pad(shineShape, SHINE_PADDING)));

            // Sharp corner between step and shine.
            const rawShineBase = sh(unionAll(pad(shineShape, STEP_PADDING)));

            debug.push([straightPath(rawBase), "hotpink"]);
            debug.push([straightPath(rawShine), "hotpink"]);
            debug.push([straightPath(rawShineBase), "hotpink"]);

            // TODO protect some corners when removing concave.
            debug.push([
                straightPath(
                    removeConcave(
                        sh(
                            union(
                                [
                                    approximate(
                                        calcRoundPoints(rawBase, STEP_RADIUS),
                                        STEP_RESOLUTION,
                                    ),
                                ],
                                [
                                    approximate(
                                        calcRoundPoints(rawShine, STEP_RADIUS),
                                        STEP_RESOLUTION,
                                    ),
                                ],
                                [
                                    approximate(
                                        calcRoundPoints(
                                            rawShineBase,
                                            STEP_RADIUS,
                                        ),
                                        STEP_RESOLUTION,
                                    ),
                                ],
                            ),
                        ),
                    ),
                ),
                "cyan",
            ]);

            // debug.push([
            //     roundedPath(
            //         calcRoundPoints(removeConcave(ring), STEP_RADIUS),
            //     ),
            //     "hotpink",
            // ]);

            const roundedStepShinePoints = approximate(
                calcRoundPoints(rawShineBase, STEP_RADIUS),
                STEP_RESOLUTION,
            );
            const stepBasePoly = sh(unionAll(pad(key.key.shape, STEP_PADDING)));
            const stepMultiPoly = xor([stepBasePoly], [roundedStepShinePoints]);
            const step = stepMultiPoly
                .flat(1)
                .map((ring) => calcRoundPoints(ring.slice(1), STEP_RADIUS));
            // Remove corner artifacts.
            const filteredStep = step.filter(
                (points) => points.length != 2 + 1 / STEP_RESOLUTION,
            );

            const shinePoints = calcRoundPoints(rawShine, SHINE_RADIUS);
            const finalBasePoly = sh(
                union(
                    [approximate(shinePoints, STEP_RESOLUTION)],
                    [rawBase],
                    [stepBasePoly],
                    [roundedStepShinePoints],
                ),
            );
            // debug.push([straightPath(finalBasePoly), "cyan"]);
            const roundedFinalBasePoints = calcRoundPoints(
                removeConcave(finalBasePoly),
                BASE_RADIUS,
            );

            // Calculate actual step shape.
            // let a = difference([shinePoly], [roundedStepShinePoints]);
            // let finalStepMultiPoly = union(a, [roundedStepShinePoints]);
            // debug.push([straightPath(roundedStepShinePoints), "red"]);
            // a.forEach((poly) =>
            //     poly.forEach((ring) => debug.push([straightPath(ring), "red"])),
            // );
            // finalStepMultiPoly.forEach((poly) =>
            //     poly.forEach((ring) =>
            //         debug.push([
            //             roundedPath(
            //                 calcRoundPoints(removeConcave(ring), STEP_RADIUS),
            //             ),
            //             "green",
            //         ]),
            //     ),
            // );

            // TODO keep track of "original point" and make rad bridge between.
            return (
                <PlaneItem key={i} origin={[0, 0]} angle={0} position={p}>
                    <path
                        d={roundedPath(roundedFinalBasePoints)}
                        stroke="orange"
                        strokeWidth={STROKE}
                        fill="white"
                    />
                    {filteredStep.map((points, i) => (
                        <path
                            key={i}
                            d={roundedPath(points)}
                            stroke="green"
                            strokeWidth={STROKE}
                            fill="white"
                        />
                    ))}
                    {roundedFinalBasePoints.length <= shinePoints.length &&
                        roundedFinalBasePoints.map((p, i) => (
                            <RadBridge
                                key={i}
                                quadA={p}
                                quadB={shinePoints[i]}
                                color="red"
                                width={STROKE}
                                {...({} as any)}
                            />
                        ))}
                    <path
                        d={roundedPath(shinePoints)}
                        stroke="blue"
                        strokeWidth={STROKE}
                        fill="white"
                    />
                    {true &&
                        debug.map(([side, color], i) => (
                            <path
                                key={i + 1234234234}
                                d={side}
                                stroke={color}
                                strokeWidth={STROKE / 4}
                                fill="transparent"
                            />
                        ))}
                </PlaneItem>
            );
        })}
    </Plane>
);
