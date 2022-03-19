import {difference} from "polygon-clipping";

import {Box, toShape} from "./box";
import {memCache} from "./cache";
import {CurveShape, approx, bridgeArcs, toSVGPath as curvedPath} from "./curve";
import {genID} from "./identity";
import {Line, Point} from "./point";
import {Possible, isErr} from "./possible";
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
    shelfArcBridges: Line[];
    shelfPath: string;
    topLegendBox: Box;
    frontLegendBox: Box;
}

export const BORDER = 0.02;
const KEY_PAD = BORDER / 2;
const KEY_PADDING: [number, number, number] = [KEY_PAD, KEY_PAD, KEY_PAD];
export const KEY_RADIUS = 0.01;
const SHELF_RADIUS = 0.05;
const ROUND_RESOLUTION = 1 / 5;
export const SHELF_PADDING_TOP = -0.1;
const SHELF_PADDING_SIDE = 0.12;
export const SHELF_PADDING_BOTTOM = 2 * SHELF_PADDING_SIDE - SHELF_PADDING_TOP; // Keep top square.
const SHELF_PADDING: [number, number, number] = [
    SHELF_PADDING_TOP,
    SHELF_PADDING_SIDE,
    SHELF_PADDING_BOTTOM,
];
const STEP_RATIO = 0.5;
const STEP_RADIUS =
    Math.min(KEY_RADIUS, SHELF_RADIUS) +
    Math.abs(KEY_RADIUS - SHELF_RADIUS) * STEP_RATIO;
const STEP_PADDING: [number, number, number] = [
    SHELF_PADDING_TOP * STEP_RATIO,
    SHELF_PADDING_SIDE * STEP_RATIO,
    SHELF_PADDING_BOTTOM * STEP_RATIO,
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
const internalCalcKeycap = (key: KeycapInput): Possible<CalculatedKeycap> => {
    const boxes = pad(key.base, KEY_PADDING);
    const shelfShape = pad(
        key.shelf && key.shelf.length ? key.shelf : key.base,
        KEY_PADDING,
    );

    // Sharp key base.
    const rawBase = toShape(boxes);
    if (isErr(rawBase)) return rawBase.err.fwd("base");
    const roundBase = round(rawBase, KEY_RADIUS, KEY_RADIUS);

    // Shelf outer edge.
    const rawStep = toShape(pad(boxes, STEP_PADDING));
    if (isErr(rawStep)) return rawStep.err.fwd("step");
    const roundStep = round(rawStep, STEP_RADIUS, KEY_RADIUS);
    const approxStep = approx(roundStep, ROUND_RESOLUTION);

    // Shelf shape.
    const rawShelf = toShape(pad(shelfShape, SHELF_PADDING));
    if (isErr(rawShelf)) return rawShelf.err.fwd("shelf");
    const roundShelf = round(rawShelf, SHELF_RADIUS, KEY_RADIUS);

    // Shelf inner edge.
    const rawShelfBase = toShape(pad(shelfShape, STEP_PADDING));
    if (isErr(rawShelfBase)) return rawShelfBase.err.fwd("shelf base");
    const roundShelfBase = round(rawShelfBase, STEP_RADIUS, KEY_RADIUS);
    const approxShelfBase = approx(roundShelfBase, ROUND_RESOLUTION);

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
    const baseArcBridges = arcs(1 / ROUND_RESOLUTION, roundBase, roundStep);
    const shelfArcBridges = arcs(
        1 / ROUND_RESOLUTION,
        roundShelfBase,
        roundShelf,
    );

    // Combine all shapes into footprint.
    const finalBase = multiUnion(
        approx(roundBase, ROUND_RESOLUTION),
        approxStep,
        approx(roundShelf, ROUND_RESOLUTION),
        approxShelfBase,
        ...arcCorners,
    )[0];

    // Create step shape with the shelf stamped out.
    const inflatePadding = STEP_PADDING.map((n) => n - BORDER / 1000) as any;
    const inflatedShelf = toShape(pad(shelfShape, inflatePadding));
    if (isErr(inflatedShelf)) return inflatedShelf.err.fwd("inflated shelf");
    const approxInflatedShelfBase = approx(
        round(inflatedShelf, STEP_RADIUS, KEY_RADIUS),
        ROUND_RESOLUTION,
    );
    const approxStepOnly: Composite = difference(
        [approxStep],
        [approxInflatedShelfBase],
    )
        .flat(1)
        .map((r) => r.slice(1));

    // Create front legend box.
    let lowestEdge: Point[] = [];
    let lowestY = 0;
    for (const point of finalBase) {
        if (point[1] > lowestY) {
            lowestY = point[1];
            lowestEdge = [point];
        } else if (point[1] === lowestY) {
            lowestEdge.push(point);
        }
    }
    let lowestX = Infinity;
    let highestX = 0;
    for (const point of lowestEdge) {
        if (point[0] < lowestX) {
            lowestX = point[0];
        }
        if (point[0] > highestX) {
            highestX = point[0];
        }
    }
    const frontLegendBox: Box = {
        height: SHELF_PADDING_BOTTOM,
        width: highestX - lowestX - 2 * SHELF_PADDING_SIDE,
        offset: [lowestX + SHELF_PADDING_SIDE, lowestY - SHELF_PADDING_BOTTOM],
    };

    const calculatedKeycap: CalculatedKeycap = {
        basePathPoints: finalBase,
        basePath: straightPath(finalBase),
        stepPaths: approxStepOnly.map(straightPath),
        baseArcBridges,
        shelfArcBridges,
        shelfPath: curvedPath(roundShelf),
        topLegendBox: pad(shelfShape, SHELF_PADDING)[0],
        frontLegendBox: frontLegendBox,
    };
    return calculatedKeycap;
};

export const calcKeycap = memCache(
    (input) => genID("keycap-shape", input),
    internalCalcKeycap,
);
