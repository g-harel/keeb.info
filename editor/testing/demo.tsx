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

import {
    Blank,
    KeysetKeycap,
    KeysetKeycapLegends,
    Pair,
    QuadPoint,
    Shape,
} from "../../internal/types/base";
import {Key} from "../components/key";
import {Plane, PlaneItem} from "../components/plane";
import {unionAll} from "../../internal/measure";
import {RadBridge} from "../components/rad-bridge";
import {
    BORDER,
    DEBUG,
    KEY_RADIUS,
    ROUND_RESOLUTION,
    SHINE_PADDING_BOTTOM,
    SHINE_PADDING_SIDE,
    SHINE_PADDING_TOP,
    SHINE_RADIUS,
    STEP_RADIUS,
    STEP_RATIO,
} from "../cons";
import {
    approx,
    removeConcave,
    round,
    roundedPath,
    straightPath,
} from "../../internal/geometry";
import {ReactProps} from "../../internal/types/util";

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
    SHINE_PADDING_TOP * STEP_RATIO,
    SHINE_PADDING_SIDE * STEP_RATIO,
    SHINE_PADDING_BOTTOM * STEP_RATIO,
];
const SHINE_PADDING: [number, number, number] = [
    SHINE_PADDING_TOP,
    SHINE_PADDING_SIDE,
    SHINE_PADDING_BOTTOM,
];

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

export const Key2 = (props: KeyProps) => {
    const stepped = props.shelf && props.shelf.length > 0;
    const shineShape = stepped ? props.shelf : props.blank.shape;
    const debug: [string, string][] = []; // [path, color] TODO remove

    // Sharp key base.
    const rawBase = sh(unionAll(props.blank.shape));
    const roundBase = round(rawBase, KEY_RADIUS);

    // Shine outer edge.
    const rawStep = sh(unionAll(pad(props.blank.shape, STEP_PADDING)));
    const roundStep = round(rawStep, STEP_RADIUS);
    const approxStep = approx(roundStep, ROUND_RESOLUTION);

    // Shine shape.
    const rawShine = sh(unionAll(pad(shineShape, SHINE_PADDING)));
    const roundShine = round(rawShine, SHINE_RADIUS);

    // Shine inner edge.
    const rawShineBase = sh(unionAll(pad(shineShape, STEP_PADDING)));
    const roundShineBase = round(rawShineBase, STEP_RADIUS);
    const approxShineBase = approx(roundShineBase, ROUND_RESOLUTION);

    // Rounded border around the key.
    // TODO handle intersecting shine base.
    const finalBase = removeConcave(
        sh(
            union(
                [approx(roundBase, ROUND_RESOLUTION)],
                [approxStep],
                [approx(roundShine, ROUND_RESOLUTION)],
                [approxShineBase],
            ),
        ),
        rawShineBase,
    );

    const inflatePadding = STEP_PADDING.map((n) => n - BORDER / 1000) as any;
    const approxInflatedShineBase = approx(
        round(sh(unionAll(pad(shineShape, inflatePadding))), STEP_RADIUS),
        ROUND_RESOLUTION,
    );
    const approxStepOnly = difference([approxStep], [approxInflatedShineBase])
        .flat(1)
        .map((r) => r.slice(1));

    // TODO keep track of "original point" and make rad bridge between.
    return (
        <g>
            <path
                d={straightPath(finalBase)}
                stroke="grey"
                strokeWidth={BORDER}
                fill="white"
            />
            {roundBase.map((p, i) => (
                <RadBridge
                    key={i}
                    quadA={p}
                    quadB={roundStep[i]}
                    color="grey"
                    width={BORDER / 1.2}
                    sideCount={1 / ROUND_RESOLUTION}
                    {...({} as any)}
                />
            ))}
            {approxStepOnly.map((points, i) => (
                <path
                    key={i}
                    d={straightPath(points)}
                    stroke="grey"
                    strokeWidth={BORDER}
                    fill="white"
                />
            ))}
            {roundShineBase.map((p, i) => (
                <RadBridge
                    key={i}
                    quadA={p}
                    quadB={roundShine[i]}
                    color="grey"
                    width={BORDER / 1.2}
                    sideCount={1 / ROUND_RESOLUTION}
                    {...({} as any)}
                />
            ))}
            <path
                d={roundedPath(roundShine)}
                stroke="grey"
                strokeWidth={BORDER}
                fill="white"
            />
            {DEBUG &&
                debug.map(([side, color], i) => (
                    <path
                        key={i + 1234234234}
                        d={side}
                        stroke={color}
                        strokeWidth={BORDER / 4}
                        fill="transparent"
                        strokeOpacity="0.7"
                    />
                ))}
        </g>
    );
};

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
            const roundBase = round(rawBase, KEY_RADIUS);

            // Shine outer edge.
            const rawStep = sh(unionAll(pad(key.key.shape, STEP_PADDING)));
            const roundStep = round(rawStep, STEP_RADIUS);
            const approxStep = approx(roundStep, ROUND_RESOLUTION);

            // Shine shape.
            const rawShine = sh(unionAll(pad(shineShape, SHINE_PADDING)));
            const roundShine = round(rawShine, SHINE_RADIUS);

            // Shine inner edge.
            const rawShineBase = sh(unionAll(pad(shineShape, STEP_PADDING)));
            const roundShineBase = round(rawShineBase, STEP_RADIUS);
            const approxShineBase = approx(roundShineBase, ROUND_RESOLUTION);

            // Rounded border around the key.
            // TODO handle intersecting shine base.
            const finalBase = removeConcave(
                sh(
                    union(
                        [approx(roundBase, ROUND_RESOLUTION)],
                        [approxStep],
                        [approx(roundShine, ROUND_RESOLUTION)],
                        [approxShineBase],
                    ),
                ),
                rawShineBase,
            );

            const inflatePadding = STEP_PADDING.map(
                (n) => n - BORDER / 1000,
            ) as any;
            const approxInflatedShineBase = approx(
                round(
                    sh(unionAll(pad(shineShape, inflatePadding))),
                    STEP_RADIUS,
                ),
                ROUND_RESOLUTION,
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
                        stroke="grey"
                        strokeWidth={BORDER}
                        fill="white"
                    />
                    {roundBase.map((p, i) => (
                        <RadBridge
                            key={i}
                            quadA={p}
                            quadB={roundStep[i]}
                            color="grey"
                            width={BORDER / 1.2}
                            sideCount={1 / ROUND_RESOLUTION}
                            {...({} as any)}
                        />
                    ))}
                    {approxStepOnly.map((points, i) => (
                        <path
                            key={i}
                            d={straightPath(points)}
                            stroke="grey"
                            strokeWidth={BORDER}
                            fill="white"
                        />
                    ))}
                    {roundShineBase.map((p, i) => (
                        <RadBridge
                            key={i}
                            quadA={p}
                            quadB={roundShine[i]}
                            color="grey"
                            width={BORDER / 1.2}
                            sideCount={1 / ROUND_RESOLUTION}
                            {...({} as any)}
                        />
                    ))}
                    <path
                        d={roundedPath(roundShine)}
                        stroke="grey"
                        strokeWidth={BORDER}
                        fill="white"
                    />
                    {DEBUG &&
                        debug.map(([side, color], i) => (
                            <path
                                key={i + 1234234234}
                                d={side}
                                stroke={color}
                                strokeWidth={BORDER / 4}
                                fill="transparent"
                                strokeOpacity="0.7"
                            />
                        ))}
                </PlaneItem>
            );
        })}
    </Plane>
);
