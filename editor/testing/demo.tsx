import React from "react";
import {resolveColor} from "../../internal/colors";
import {Polygon, MultiPolygon, union, intersection} from "polygon-clipping";

import {KeysetKeycap, Pair} from "../../internal/types/base";
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
        shelf: [{height: 1, width: 1.25, offset: [0, 0]}],
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

const radius = 0.05;
const stroke = 0.02;

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

            const multiPoly = unionShape(key.key.shape);
            if (multiPoly.length > 1) throw "TODO split key";
            if (multiPoly[0].length > 1) throw "TODO split key2";
            const poly = multiPoly[0][0];

            const safePoly = [...poly, poly[1]];
            let path = "";
            for (let i = 1; i < safePoly.length - 1; i++) {
                const before = safePoly[i - 1];
                const current = safePoly[i];
                const after = safePoly[i + 1];

                const angle = angleBetween(before, after, current) / 2;
                const chopLength = radius / Math.cos(angle);

                let beforeFraction = chopLength / distance(before, current);
                if (beforeFraction > 0.5) beforeFraction = 0.5;
                const start = [
                    before[0] + (1 - beforeFraction) * (current[0] - before[0]),
                    before[1] + (1 - beforeFraction) * (current[1] - before[1]),
                ];

                let afterFraction = chopLength / distance(after, current);
                if (afterFraction > 0.5) afterFraction = 0.5;
                const end = [
                    after[0] + (1 - afterFraction) * (current[0] - after[0]),
                    after[1] + (1 - afterFraction) * (current[1] - after[1]),
                ];

                path += `${i === 1 ? "M" : "L"} ${start[0]} ${start[1]} `;
                path += `Q ${current[0]} ${current[1]} ${end[0]} ${end[1]} `;
            }
            path += "Z";

            const pathID = String(Math.random());
            const clipID = String(Math.random());
            return (
                <PlaneItem key={i} origin={[0, 0]} angle={0} position={p}>
                    <path
                        id={pathID}
                        d={path}
                        clipPath={`url(#${clipID})`}
                        stroke="red"
                        strokeWidth={stroke * 2}
                        fill="none"
                    />
                    <clipPath id={clipID}>
                        <use xlinkHref={`#${pathID}`} />
                    </clipPath>
                </PlaneItem>
            );
        })}
    </Plane>
);
