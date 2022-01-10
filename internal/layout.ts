import {ROTATION_ORIGIN} from "../editor/cons";
import {Blank} from "./blank";
import {Box, corners, pad as padBox} from "./box";
import {UUID} from "./identity";
import {add, rotateCoord} from "./point";
import {Angle, Point, RightAngle, minmax as pointMinmax} from "./point";
import {Composite, doesIntersect, multiUnion, Shape} from "./shape";

// Keyboard layout.
export interface Layout {
    // Unique identifier to refer to the layout.
    ref: UUID;

    // Blockers that do not overlap and are not part of a section.
    fixedBlockers: LayoutBlocker[];

    // Keys that do not overlap and not part of a section.
    fixedKeys: LayoutKey[];

    // Sections of layout where multiple options can be used.
    variableKeys: LayoutSection[];
}

export interface LayoutSection {
    // Unique identifier to refer to the section.
    ref: UUID;

    // Options available for the section.
    // All options should overlap exactly.
    options: LayoutOption[];
}

// Key placement options for an overlapping section of the layout.
export interface LayoutOption {
    // Unique identifier to refer to the option.
    ref: UUID;

    // Blocker positions when layout option is selected.
    blockers: LayoutBlocker[];

    // Key positions when layout option is selected.
    keys: LayoutKey[];
}

export type LayoutEntity = LayoutKey | LayoutBlocker;

// Blocker for for non-key elements like encoders and screens.
// TODO rename (blocker has a meaning already)
export interface LayoutBlocker {
    // Unique identifier to refer to the blocker.
    ref: UUID;

    // Hint to indicate the purpose of the blocker.
    label: string;

    // Shape of the blocker.
    boxes: Box[];

    // Position of the blocker in the layout.
    position: Point;

    // Angle of rotation of the blocker.
    angle: Angle;
}

// Location in the layout where a key can be populated.
// TODO add option for a graphic.
export interface LayoutKey {
    // Unique identifier to refer to key.
    ref: UUID;

    // Physical attributes of the key footprint.
    blank: Blank;

    // Position of the key on the layout.
    position: Point;

    // Angle of the footprint (rotated around 0,0).
    // +180deg for inverted switches.
    angle: Angle;

    // Orientation of the switch in the footprint.
    orientation: RightAngle;
}

// Maximum offset for options will be INC * ATTEMPTS.
const PAD = 0.45;
const INC = 0.101;
const ATTEMPTS = 100;

// TODO include blockers.
export const minmax = (layout: Layout): [Point, Point] => {
    const keys: LayoutKey[] = layout.fixedKeys.slice();
    for (const section of layout.variableKeys) {
        for (const option of section.options) {
            keys.push(...option.keys);
        }
    }
    const coords: Point[] = [];
    for (const key of keys) {
        for (const box of key.blank.boxes) {
            coords.push(
                ...corners(key.position, box).map((corner) =>
                    rotateCoord(corner, ROTATION_ORIGIN, key.angle),
                ),
            );
        }
    }

    return pointMinmax(coords);
};

const deepCopy = <T>(o: T): T => {
    return JSON.parse(JSON.stringify(o));
};

export const offset =
    <T extends LayoutEntity>(n: Point) =>
    (entity: T): T => {
        const oEntity = deepCopy(entity);
        oEntity.position[0] += n[0];
        oEntity.position[1] += n[1];
        return oEntity;
    };

export const pad =
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

export const toComposite = (entity: LayoutEntity) => {
    let boxes: Box[] = [];
    if ("boxes" in entity) {
        boxes = entity.boxes;
    } else {
        boxes = entity.blank.boxes;
    }

    return boxes.map((box) =>
        corners(entity.position, box).map((corner) =>
            rotateCoord(corner, ROTATION_ORIGIN, entity.angle),
        ),
    );
};

export const footprint = (layout: Layout): Composite => {
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
