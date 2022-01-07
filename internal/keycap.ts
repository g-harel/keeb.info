import {difference} from "polygon-clipping";

import * as c from "../editor/cons";
import {Box, toShape} from "./box";
import {memCache} from "./cache";
import {CurveShape, approx, bridgeArcs, toSVGPath as curvedPath} from "./curve";
import {genID} from "./identity";
import {Line, Point} from "./point";
import {
    Composite,
    Shape,
    multiUnion,
    round,
    toSVGPath as straightPath,
} from "./shape";

export interface KeycapInput {
    base: Box[];
    shelf?: Box[];
}

interface CalculatedKeycap {
    basePathPoints: Shape;
    basePath: string;
    stepPaths: string[];
    baseArcBridges: Line[];
    shineArcBridges: Line[];
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

const pad = (boxes: Box[], padding: [number, number, number]): Box[] => {
    return boxes.map((box) => ({
        width: box.width - 2 * padding[1],
        height: box.height - padding[0] - padding[2],
        offset: [
            box.offset[0] + padding[1],
            box.offset[1] + padding[0],
        ] as Point,
    }));
};

// TODO validate step is inside base.
const internalCalcKeycap = (key: KeycapInput): CalculatedKeycap => {
    const boxes = pad(key.base, KEY_PADDING);
    const shineShape = pad(
        key.shelf && key.shelf.length ? key.shelf : key.base,
        KEY_PADDING,
    );

    // Sharp key base.
    const rawBase = toShape(boxes);
    const roundBase = round(rawBase, c.KEY_RADIUS, c.KEY_RADIUS);

    // Shine outer edge.
    const rawStep = toShape(pad(boxes, STEP_PADDING));
    const roundStep = round(rawStep, c.STEP_RADIUS, c.KEY_RADIUS);
    const approxStep = approx(roundStep, c.ROUND_RESOLUTION);

    // Shine shape.
    const rawShine = toShape(pad(shineShape, SHINE_PADDING));
    const roundShine = round(rawShine, c.SHINE_RADIUS, c.KEY_RADIUS);

    // Shine inner edge.
    const rawShineBase = toShape(pad(shineShape, STEP_PADDING));
    const roundShineBase = round(rawShineBase, c.STEP_RADIUS, c.KEY_RADIUS);
    const approxShineBase = approx(roundShineBase, c.ROUND_RESOLUTION);

    // Calculate corner bridge lines and shapes.
    const arcCorners: Shape[] = [];
    const arcs = (count: number, a: CurveShape, b: CurveShape) => {
        const out: Line[] = [];
        a.forEach((p, i) => {
            const lines = bridgeArcs(count, p, b[i]);
            out.push(...lines);

            const localCorners: Shape[] = [];
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
        return out;
    };
    const baseArcBridges = arcs(1 / c.ROUND_RESOLUTION, roundBase, roundStep);
    const shineArcBridges = arcs(
        1 / c.ROUND_RESOLUTION,
        roundShineBase,
        roundShine,
    );

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
            toShape(pad(shineShape, inflatePadding)),
            c.STEP_RADIUS,
            c.KEY_RADIUS,
        ),
        c.ROUND_RESOLUTION,
    );
    const approxStepOnly: Composite = difference(
        [approxStep],
        [approxInflatedShineBase],
    )
        .flat(1)
        .map((r) => r.slice(1));

    const calculatedKeycap: CalculatedKeycap = {
        basePathPoints: finalBase,
        basePath: straightPath(finalBase),
        stepPaths: approxStepOnly.map(straightPath),
        baseArcBridges,
        shineArcBridges,
        shinePath: curvedPath(roundShine),
    };
    return calculatedKeycap;
};

export const calcKeycap = memCache(
    (input) => genID("keycap-shape", input),
    internalCalcKeycap,
);
