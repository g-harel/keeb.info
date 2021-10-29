import React from "react";
import {MultiPolygon, union, difference} from "polygon-clipping";

import {Pair, Shape} from "../../internal/types/base";
import {KeyProps} from "../components/key";
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
