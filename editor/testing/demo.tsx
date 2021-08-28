import React from "react";
import {resolveColor} from "../../internal/colors";
import {Polygon, MultiPolygon, union, intersection, xor} from "polygon-clipping";

import {KeysetKeycap, Pair, Shape} from "../../internal/types/base";
import {Key} from "../components/key";
import {Plane, PlaneItem} from "../components/plane";
import {unionShape} from "../../internal/measure";

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
        shelf: [],
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
        shelf: [{height: 1, width: 0.5, offset: [0.65, 0]}, {height: 0.5, width: 1.75, offset: [0, 0.25]}],
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

// Rounded corner using a quadratic bezier.
type RoundedPoint = [Pair, Pair, Pair];

const calcRoundPoints = (shape: Pair[], radius: number): RoundedPoint[] => {
    const points: RoundedPoint[] = [];
    const safePoly = [...shape, shape[0], shape[1]];
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

const approximate = (rounded: RoundedPoint[], resolution: number): Pair[] => {
    const points: Pair[] = [];
    for (const point of rounded) {
        const [p0, p1, p2] = point;
        for (let p = 0; p <= 1; p += resolution) {
            points.push(splitLine(p, splitLine(p, p0, p1), splitLine(p, p1, p2)));
        }
    }
    return points;
}

const straightPath = (points: Pair[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [start, end] = points[i];
        path += `${i === 0 ? "M" : "L"} ${start} ${end} `;
    }
    path += "Z";
    console.log(path)
    return path;
};

const roundedPath = (points: RoundedPoint[]): string => {
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
}

const SHINE_RADIUS = 0.05;
const BASE_RADIUS = 0.02;
const RAISE_RATIO = 0.6;
const RAISE_RADIUS = Math.min(BASE_RADIUS, SHINE_RADIUS) + Math.abs(BASE_RADIUS - SHINE_RADIUS) * RAISE_RATIO;
const RAISE_RESOLUTION = 1 / 10;
const STROKE = 0.02;
const PAD_TOP = -1.65 * STROKE;
const PAD_SIDE = 0.12;
const PAD_BOTTOM = 2 * PAD_SIDE - PAD_TOP; // Keep top square.

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

            const baseMultiPoly = unionShape(key.key.shape);
            if (baseMultiPoly.length > 1) throw "TODO split key";
            if (baseMultiPoly[0].length > 1) throw "TODO split key2";
            const basePoly = baseMultiPoly[0][0].slice(1);
            const basePoints = calcRoundPoints(basePoly, BASE_RADIUS);

            const sourceShineShape = stepped ? key.shelf : key.key.shape;
            const shineShape = pad(sourceShineShape, [PAD_TOP, PAD_SIDE, PAD_BOTTOM]);
            const shineMultiPoly = unionShape(shineShape);
            if (shineMultiPoly.length > 1) throw "TODO split key";
            if (shineMultiPoly[0].length > 1) throw "TODO split key2";
            const shinePoly = shineMultiPoly[0][0].slice(1);
            const shinePoints = calcRoundPoints(shinePoly, SHINE_RADIUS);

            const raisedPadding: [number, number, number] = [PAD_TOP * RAISE_RATIO, PAD_SIDE * RAISE_RATIO, PAD_BOTTOM * RAISE_RATIO];
            const raisedBase = pad(key.key.shape, raisedPadding);
            const raisedBaseMultiPoly = unionShape(raisedBase);
            if (raisedBaseMultiPoly.length > 1) throw "TODO split key";
            if (raisedBaseMultiPoly[0].length > 1) throw "TODO split key2";
            const raisedBasePoly = raisedBaseMultiPoly[0][0].slice(1);

            const raisedShine = pad(sourceShineShape, raisedPadding);
            const raisedShineMultiPoly = unionShape(raisedShine);
            if (raisedShineMultiPoly.length > 1) throw "TODO split key";
            if (raisedShineMultiPoly[0].length > 1) throw "TODO split key2";
            const raisedShinePoly = raisedShineMultiPoly[0][0].slice(1);
            const roundedRaisedShinePoints = approximate(calcRoundPoints(raisedShinePoly, RAISE_RADIUS), RAISE_RESOLUTION);

            const raisedMultiPoly = xor([raisedBasePoly], [roundedRaisedShinePoints]);
            const raised = raisedMultiPoly.flat(1).map((ring) => calcRoundPoints(ring.slice(1), RAISE_RADIUS));
            // Remove conrer artifacts.
            const filteredRaised = raised.filter((points) => points.length > (2 + 1 / RAISE_RESOLUTION));

            return (
                <PlaneItem key={i} origin={[0, 0]} angle={0} position={p}>
                    <path
                        d={roundedPath(basePoints)}
                        stroke="orange"
                        strokeWidth={STROKE}
                        fill="white"
                    />
                    {filteredRaised.map((points, i) => (
                        <path
                            key={i}
                            d={roundedPath(points)}
                            stroke="green"
                            strokeWidth={STROKE}
                            fill="white"
                        />
                    ))}
                    <path
                        d={roundedPath(shinePoints)}
                        stroke="blue"
                        strokeWidth={STROKE}
                        fill="white"
                    />
                </PlaneItem>
            );
        })}
    </Plane>
);
