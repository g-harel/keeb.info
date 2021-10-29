import React from "react";
import {resolveColor} from "../../internal/colors";

import {KeysetKeycap, Pair} from "../../internal/types/base";
import {Plane, PlaneItem} from "../components/plane";
import {Key} from "../components/key";

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

export const Demo = () => (
    <Plane pixelWidth={1200} unitSize={[10, 4]}>
        {keys.map((key, i) => {
            const p: Pair = [key.position[0], key.position[1]];
            return (
                <PlaneItem key={i} origin={[0, 0]} angle={0} position={p}>
                    <Key color="lightgrey" blank={key.key} shelf={key.shelf} />
                </PlaneItem>
            );
        })}
    </Plane>
);
