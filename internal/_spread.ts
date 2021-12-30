import * as c from "../editor/cons";
import {Box, corners} from "./box";
import {Layout, LayoutBlocker, LayoutKey} from "./layout";
import {rotateCoord} from "./point";
import {Angle, Point} from "./point";
import {doesIntersect, multiUnion} from "./shape";

// TODO standardize naming of geometry constructs

const deepCopy = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};

const offsetKey = (key: LayoutKey, offset: Point): LayoutKey => {
    const oKey: LayoutKey = deepCopy(key);
    oKey.position[0] += offset[0];
    oKey.position[1] += offset[1];
    return oKey;
};

const padBox = (box: Box, pad: number): Box => {
    return {
        width: box.width + 2 * pad,
        height: box.height + 2 * pad,
        offset: [box.offset[0] - pad, box.offset[1] - pad],
    };
};

const computeRings = (
    boxes: Box[],
    position: Point,
    angle: Angle,
    pad = 0,
): Point[][] => {
    return boxes.map((box) =>
        corners(position, padBox(box, pad)).map((corner) =>
            rotateCoord(corner, c.ROTATION_ORIGIN, angle),
        ),
    );
};

const ringsFromKey =
    (pad = 0) =>
    (key: LayoutKey): Point[][] => {
        return computeRings(key.key.boxes, key.position, key.angle, pad);
    };

const ringsFromBlocker =
    (pad = 0) =>
    (blocker: LayoutBlocker): Point[][] => {
        return computeRings(
            blocker.boxes,
            blocker.position,
            blocker.angle,
            pad,
        );
    };

// TODO validate section overlap.
// TODO make this faster.
export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = deepCopy(layout);

    const allRings: Point[][] = [];
    allRings.push(
        ...out.fixedKeys.map(ringsFromKey(c.LAYOUT_OPTIONS_PADDING)).flat(1),
    );
    allRings.push(
        ...out.fixedBlockers
            .map(ringsFromBlocker(c.LAYOUT_OPTIONS_PADDING))
            .flat(1),
    );
    for (const options of layout.variableKeys) {
        allRings.push(
            ...options.options[0].keys
                .map(ringsFromKey(c.LAYOUT_OPTIONS_PADDING))
                .flat(1),
        );
        allRings.push(
            ...options.options[0].blockers
                .map(ringsFromBlocker(c.LAYOUT_OPTIONS_PADDING))
                .flat(1),
        );
    }
    let avoid: Point[][] = multiUnion(...allRings);

    for (const section of out.variableKeys) {
        // Keep track of how far last option had to be moved and start there.
        let lastIncrement = 1;
        for (const option of section.options.slice(1)) {
            // Move option until it doesn't intersect.
            // TODO include blockers
            for (
                let j = lastIncrement;
                j <= c.LAYOUT_SPREAD_ATTEMPTS;
                j += c.LAYOUT_SPREAD_INCREMENT
            ) {
                if (j === c.LAYOUT_SPREAD_ATTEMPTS) {
                    console.error("TODO spread failed");
                    continue;
                }
                let found = false;
                for (const offset of [
                    [0, j],
                    [0, -j],
                ] as Point[]) {
                    let intersects = false;
                    for (const key of option.keys) {
                        if (
                            doesIntersect(
                                avoid,
                                ringsFromKey()(offsetKey(key, offset)),
                            )
                        ) {
                            intersects = true;
                            break;
                        }
                    }
                    if (!intersects) {
                        found = true;
                        lastIncrement = j;
                        for (const key of option.keys) {
                            key.position = offsetKey(key, offset).position;
                        }
                        // TODO offset blocker
                        avoid = multiUnion(
                            ...avoid,
                            ...option.keys.map(ringsFromKey()).flat(1),
                            ...option.blockers.map(ringsFromBlocker()).flat(1),
                        );
                        break;
                    }
                }
                if (found) break;
            }
        }
    }

    return out;
};
