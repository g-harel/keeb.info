import {difference} from "polygon-clipping";

import {Pair, QuadPoint, Shape} from "./types/base";
import * as c from "../editor/cons";
import {
    approx,
    round,
    roundedPath,
    straightPath,
    bridgeArcs,
    multiUnion,
    joinShape,
} from "./geometry";

export interface Input {
    base: Shape[];
    shelf?: Shape[];
}

interface CalculatedKeycap {
    basePath: string;
    stepPaths: string[];
    arcBridgeLines: [Pair, Pair][];
    shinePath: string;
}

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

export const calcKeycap = (key: Input): CalculatedKeycap => {
    const shape = pad(key.base, KEY_PADDING);
    const shineShape = pad(
        key.shelf && key.shelf.length ? key.shelf : key.base,
        KEY_PADDING,
    );

    // Sharp key base.
    const rawBase = joinShape(shape);
    const roundBase = round(rawBase, c.KEY_RADIUS, c.KEY_RADIUS);

    // Shine outer edge.
    const rawStep = joinShape(pad(shape, STEP_PADDING));
    const roundStep = round(rawStep, c.STEP_RADIUS, c.KEY_RADIUS);
    const approxStep = approx(roundStep, c.ROUND_RESOLUTION);

    // Shine shape.
    const rawShine = joinShape(pad(shineShape, SHINE_PADDING));
    const roundShine = round(rawShine, c.SHINE_RADIUS, c.KEY_RADIUS);

    // Shine inner edge.
    const rawShineBase = joinShape(pad(shineShape, STEP_PADDING));
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
        round(
            joinShape(pad(shineShape, inflatePadding)),
            c.STEP_RADIUS,
            c.KEY_RADIUS,
        ),
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
    return calculatedKeycap;
};
