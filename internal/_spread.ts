import * as c from "../editor/cons";
import {Box, corners, pad as padBox} from "./box";
import {Layout, LayoutBlocker, LayoutKey} from "./layout";
import {add, rotateCoord} from "./point";
import {Point} from "./point";
import {Composite, Shape, doesIntersect, multiUnion} from "./shape";

// Maximum offset for options will be INC * ATTEMPTS.
const PAD = 0.45;
const INC = 0.101;
const ATTEMPTS = 100;

type LayoutEntity = LayoutKey | LayoutBlocker;

// TODO simplify spread calculation with helpers.
// TODO refactor current helpers.

const deepCopy = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};

const offset =
    <T extends LayoutEntity>(n: Point) =>
    (entity: T): T => {
        const oEntity = deepCopy(entity);
        oEntity.position[0] += n[0];
        oEntity.position[1] += n[1];
        return oEntity;
    };

const pad =
    <T extends LayoutEntity>(n: number) =>
    (entity: T): T => {
        const oEntity = deepCopy(entity);
        if ("boxes" in oEntity) {
            oEntity.boxes = oEntity.boxes.map((b) => padBox(b, n));
        } else {
            oEntity.blank.boxes = oEntity.blank.boxes.map((b) => padBox(b, n));
        }
        return oEntity;
    };

const toComposite = (entity: LayoutEntity) => {
    let boxes: Box[] = [];
    if ("boxes" in entity) {
        boxes = entity.boxes;
    } else {
        boxes = entity.blank.boxes;
    }

    return boxes.map((box) =>
        corners(entity.position, box).map((corner) =>
            rotateCoord(corner, c.ROTATION_ORIGIN, entity.angle),
        ),
    );
};

const footprint = (layout: Layout): Composite => {
    const shapes: Shape[] = [];
    // Add fixed layout elements.
    shapes.push(...layout.fixedKeys.map(pad(PAD)).map(toComposite).flat(1));
    shapes.push(...layout.fixedBlockers.map(pad(PAD)).map(toComposite).flat(1));
    // Add first option of each variable section.
    for (const v of layout.variableKeys) {
        shapes.push(
            ...v.options[0].keys.map(pad(PAD)).map(toComposite).flat(1),
        );
        shapes.push(
            ...v.options[0].blockers.map(pad(PAD)).map(toComposite).flat(1),
        );
    }
    return multiUnion(...shapes);
};

// TODO validate section overlap.
// TODO consider returning -> const offsets: Record<UUID, Point> = {};
export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = deepCopy(layout);

    let avoid = footprint(layout);

    for (const section of out.variableKeys) {
        // Keep track of how far last option had to be moved and start there.
        let lastIncrement = 1;
        for (const option of section.options.slice(1)) {
            // Move option until it doesn't intersect.
            for (let j = lastIncrement; ; j += INC) {
                // Break when too many attempts.
                if (j >= ATTEMPTS * INC) {
                    console.log(
                        `spread failed for option: ${layout.ref}, ${section.ref}, ${option.ref}`,
                    );
                    break;
                }

                const offsetAmount: Point = [0, j];

                // Check if any key/blocker of the option intersects.
                let intersects = false;
                for (const key of option.keys) {
                    const s = toComposite(offset(offsetAmount)(key));
                    if (doesIntersect(avoid, s)) {
                        intersects = true;
                        break;
                    }
                }
                for (const blocker of option.blockers) {
                    const s = toComposite(offset(offsetAmount)(blocker));
                    if (doesIntersect(avoid, s)) {
                        intersects = true;
                        break;
                    }
                }
                if (intersects) continue;

                // Modify option members and add to avoided area.
                lastIncrement = j;
                for (const key of option.keys) {
                    key.position = add(key.position, offsetAmount);
                }
                for (const blocker of option.blockers) {
                    blocker.position = add(blocker.position, offsetAmount);
                }
                avoid = multiUnion(
                    ...avoid,
                    ...option.keys.map(toComposite).flat(1),
                    ...option.blockers.map(toComposite).flat(1),
                );
                break;
            }
        }
    }

    return out;
};
