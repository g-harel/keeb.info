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
    shelfArcBridges: Line[];
    shelfPath: string;
    topLegendBox: Box;
    frontLegendBox: Box;
}

const KEY_PADDING: [number, number, number] = [c.KEY_PAD, c.KEY_PAD, c.KEY_PAD];

const STEP_PADDING: [number, number, number] = [
    c.SHELF_PADDING_TOP * c.STEP_RATIO,
    c.SHELF_PADDING_SIDE * c.STEP_RATIO,
    c.SHELF_PADDING_BOTTOM * c.STEP_RATIO,
];
const SHELF_PADDING: [number, number, number] = [
    c.SHELF_PADDING_TOP,
    c.SHELF_PADDING_SIDE,
    c.SHELF_PADDING_BOTTOM,
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
    const shelfShape = pad(
        key.shelf && key.shelf.length ? key.shelf : key.base,
        KEY_PADDING,
    );

    // Sharp key base.
    const rawBase = toShape(boxes);
    const roundBase = round(rawBase, c.KEY_RADIUS, c.KEY_RADIUS);

    // Shelf outer edge.
    const rawStep = toShape(pad(boxes, STEP_PADDING));
    const roundStep = round(rawStep, c.STEP_RADIUS, c.KEY_RADIUS);
    const approxStep = approx(roundStep, c.ROUND_RESOLUTION);

    // Shelf shape.
    const rawShelf = toShape(pad(shelfShape, SHELF_PADDING));
    const roundShelf = round(rawShelf, c.SHELF_RADIUS, c.KEY_RADIUS);

    // Shelf inner edge.
    const rawShelfBase = toShape(pad(shelfShape, STEP_PADDING));
    const roundShelfBase = round(rawShelfBase, c.STEP_RADIUS, c.KEY_RADIUS);
    const approxShelfBase = approx(roundShelfBase, c.ROUND_RESOLUTION);

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
    const shelfArcBridges = arcs(
        1 / c.ROUND_RESOLUTION,
        roundShelfBase,
        roundShelf,
    );

    // Combine all shapes into footprint.
    const finalBase = multiUnion(
        approx(roundBase, c.ROUND_RESOLUTION),
        approxStep,
        approx(roundShelf, c.ROUND_RESOLUTION),
        approxShelfBase,
        ...arcCorners,
    )[0];

    // Create step shape with the shelf stamped out.
    const inflatePadding = STEP_PADDING.map((n) => n - c.BORDER / 1000) as any;
    const approxInflatedShelfBase = approx(
        round(
            toShape(pad(shelfShape, inflatePadding)),
            c.STEP_RADIUS,
            c.KEY_RADIUS,
        ),
        c.ROUND_RESOLUTION,
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
        height: c.SHELF_PADDING_BOTTOM,
        width: highestX - lowestX - 2 * c.SHELF_PADDING_SIDE,
        offset: [
            lowestX + c.SHELF_PADDING_SIDE,
            lowestY - c.SHELF_PADDING_BOTTOM,
        ],
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
