import * as c from "../editor/cons";
import {Box, corners, pad as padBox} from "./box";
import {UUID} from "./identity";
import {Layout, LayoutBlocker, LayoutKey} from "./layout";
import {add, rotateCoord} from "./point";
import {Angle, Point} from "./point";
import {Composite, Shape, doesIntersect, multiUnion} from "./shape";

const PAD = 0.45;
const INC = 0.501;
const ATTEMPTS = 50;

// TODO simplify spread calculation with helpers.
// TODO refactor current helpers.

const deepCopy = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};

const offsetKey = (key: LayoutKey, offset: Point): LayoutKey => {
    const oKey: LayoutKey = deepCopy(key);
    oKey.position[0] += offset[0];
    oKey.position[1] += offset[1];
    return oKey;
};

const offsetBlocker = (
    blocker: LayoutBlocker,
    offset: Point,
): LayoutBlocker => {
    const oBlocker: LayoutBlocker = deepCopy(blocker);
    oBlocker.position[0] += offset[0];
    oBlocker.position[1] += offset[1];
    return oBlocker;
};

const composite = (
    boxes: Box[],
    position: Point,
    angle: Angle,
    pad = 0,
): Composite => {
    return boxes.map((box) =>
        corners(position, padBox(box, pad)).map((corner) =>
            rotateCoord(corner, c.ROTATION_ORIGIN, angle),
        ),
    );
};

const shapes = (pad: number) => (entity: LayoutKey | LayoutBlocker) => {
    if ("boxes" in entity) {
        return composite(entity.boxes, entity.position, entity.angle, pad);
    } else {
        return composite(
            entity.blank.boxes,
            entity.position,
            entity.angle,
            pad,
        );
    }
};

// TODO validate section overlap.
// TODO make this faster.
export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = deepCopy(layout);
    // TODO consider returning: const offsets: Record<UUID, Point> = {};

    const allShapes: Shape[] = [];
    // Add fixed layout elements.
    allShapes.push(...out.fixedKeys.map(shapes(PAD)).flat(1));
    allShapes.push(...out.fixedBlockers.map(shapes(PAD)).flat(1));
    // Add first option of each variable section.
    for (const vk of layout.variableKeys) {
        allShapes.push(...vk.options[0].keys.map(shapes(PAD)).flat(1));
        allShapes.push(...vk.options[0].blockers.map(shapes(PAD)).flat(1));
    }
    let avoid: Composite = multiUnion(...allShapes);

    for (const section of out.variableKeys) {
        // Keep track of how far last option had to be moved and start there.
        let lastIncrement = 1;
        for (const option of section.options.slice(1)) {
            // Move option until it doesn't intersect.
            for (let j = lastIncrement; j <= ATTEMPTS; j += INC) {
                // Break when too many attempts.
                if (j === ATTEMPTS) {
                    console.error("TODO spread failed");
                    continue;
                }

                let found = false;
                for (const direction of [j, -j]) {
                    const offset: Point = [0, direction];
                    // Check if any key/blocker of the option intersects.
                    let intersects = false;
                    for (const key of option.keys) {
                        const s = shapes(0)(offsetKey(key, offset));
                        if (doesIntersect(avoid, s)) {
                            intersects = true;
                            break;
                        }
                    }
                    for (const blocker of option.blockers) {
                        const s = shapes(0)(offsetBlocker(blocker, offset));
                        if (doesIntersect(avoid, s)) {
                            intersects = true;
                            break;
                        }
                    }
                    if (intersects) continue;

                    // Modify option members and add to avoided area.
                    found = true;
                    lastIncrement = j;
                    for (const key of option.keys) {
                        key.position = add(key.position, offset);
                    }
                    for (const blocker of option.blockers) {
                        blocker.position = add(blocker.position, offset);
                    }
                    avoid = multiUnion(
                        ...avoid,
                        ...option.keys.map(shapes(0)).flat(1),
                        ...option.blockers.map(shapes(0)).flat(1),
                    );
                    break;
                }
                if (found) break;
            }
        }
    }

    return out;
};
