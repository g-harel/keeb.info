import {Blank} from "./blank";
import {Box, corners, pad as padBox} from "./box";
import {UUID} from "./identity";
import {
    add,
    distance,
    orderVertically as order,
    rotateCoord,
    subtract,
} from "./point";
import {Angle, Point, RightAngle, minmax as pointMinmax} from "./point";
import {ROTATION_ORIGIN} from "./rendering/view";
import {
    Composite,
    Shape,
    doesIntersect,
    equalComposite,
    multiUnion,
} from "./shape";

// Keyboard layout.
export interface Layout {
    // Unique identifier to refer to the layout.
    ref: UUID;

    // Blockers that do not overlap and are not part of a section.
    fixedBlockers: LayoutBlocker[];

    // Keys that do not overlap and not part of a section.
    fixedKeys: LayoutKey[];

    // Sections of layout where multiple options can be used.
    variableSections: LayoutSection[];
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
// TODO 2022-06-17 make attempts increase with number of options + binary search?
const PAD = 0.45;
const INC = 0.10001;
const SECTION_INC = 0.001;
const ATTEMPTS = 100;

export const minmax = (layout: Layout): [Point, Point] => {
    const entities: LayoutEntity[] = layout.fixedKeys.slice();
    for (const section of layout.variableSections) {
        for (const option of section.options) {
            entities.push(...option.keys, ...option.blockers);
        }
    }
    return pointMinmax(entities.map(toComposite).flat(2));
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

export const optionFootprint = (option: LayoutOption): Composite => {
    return multiUnion(
        ...option.keys.map(toComposite).flat(1),
        ...option.blockers.map(toComposite).flat(1),
    );
};

export const layoutFootprint = (
    layout: Layout,
    footprintPad: number,
): Composite => {
    const shapes: Shape[] = [];
    // Add fixed layout elements.
    shapes.push(
        ...layout.fixedKeys.map(pad(footprintPad)).map(toComposite).flat(1),
    );
    shapes.push(
        ...layout.fixedBlockers.map(pad(footprintPad)).map(toComposite).flat(1),
    );
    // Add first option of each variable section.
    for (const v of layout.variableSections) {
        shapes.push(
            ...v.options[0].keys
                .map(pad(footprintPad))
                .map(toComposite)
                .flat(1),
        );
        shapes.push(
            ...v.options[0].blockers
                .map(pad(footprintPad))
                .map(toComposite)
                .flat(1),
        );
    }
    return multiUnion(...shapes);
};

export const orderVertically = (sections: LayoutSection[]): LayoutSection[] => {
    interface OrderableEntity {
        position: Point;
        angle: Angle;
    }

    // Collect all entities associated with each section.
    const allSectionEntities: Record<UUID, OrderableEntity[]> = {};
    for (const section of sections) {
        let sectionEntities: OrderableEntity[] = [];
        for (const option of section.options) {
            sectionEntities = sectionEntities
                .concat(option.keys)
                .concat(option.blockers);
        }
        allSectionEntities[section.ref] = sectionEntities;
    }

    // Find the lowest ranking entity for each section.
    const sectionLowestEntity: Record<UUID, OrderableEntity> = {};
    for (const [ref, sectionEntities] of Object.entries(allSectionEntities)) {
        const ordered = order(
            (entity) => [entity.position, entity.angle],
            ROTATION_ORIGIN,
            sectionEntities,
        );
        sectionLowestEntity[ref] = ordered[0];
    }

    // Order sections by the lowest entity.
    const orderedSectionEntries = order(
        ([, entry]) => {
            return [entry.position, entry.angle];
        },
        ROTATION_ORIGIN,
        Object.entries(sectionLowestEntity),
    );

    // Convert refs back to sections.
    const sectionsByRef: Record<UUID, LayoutSection> = {};
    for (const section of sections) {
        sectionsByRef[section.ref] = section;
    }
    return orderedSectionEntries.map(([ref]) => sectionsByRef[ref]);
};

// TODO return possible
// TODO 2022-06-19 do this at compile time and return offsets instead of transformed layout
export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = deepCopy(layout);

    let avoid = layoutFootprint(layout, PAD);

    let count = 0;
    for (const section of orderVertically(out.variableSections)) {
        // Keep track of how far last option had to be moved and start there.
        let lastIncrement = count * SECTION_INC;
        count++;
        const canonicalFootprint = optionFootprint(section.options[0]);
        for (const option of section.options.slice(1)) {
            // Validate overlap and reject broken section options.
            if (!equalComposite(canonicalFootprint, optionFootprint(option))) {
                console.log(
                    `invalid overlap for option: ${layout.ref}, ${section.ref}, ${option.ref}`,
                );
                option.blockers = [];
                option.keys = [];
                continue;
            }

            // Move option until it doesn't intersect.
            // TODO alternate offset between full jumps and smaller ones
            for (let j = lastIncrement; ; j += INC) {
                // Break when too many attempts.
                if (j >= ATTEMPTS * INC) {
                    // TODO 2022-06-19 float up errors to final ui
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

const pointToString = (point: Point): string => {
    return point.join(",");
};

const keyCorners = (keys: LayoutKey[]): Point[] => {
    const result: Point[] = [];
    for (const key of keys) {
        for (const box of key.blank.boxes) {
            result.push(...corners(key.position, box));
        }
    }
    return result;
};

const blockerCorners = (blockers: LayoutBlocker[]): Point[] => {
    const result: Point[] = [];
    for (const blocker of blockers) {
        for (const box of blocker.boxes) {
            result.push(...corners(blocker.position, box));
        }
    }
    return result;
};

const centerOfMass = (entities: LayoutEntity[]): Point => {
    const perimeterPoints = multiUnion(
        ...entities.map(toComposite).flat(),
    ).flat();
    const pointsSum = perimeterPoints.reduce(add, [0, 0]);
    return pointsSum.map((v) => v / perimeterPoints.length) as Point;
};

export const stackSections = (layout: Layout): Layout => {
    // Collect all corners from fixed keys.
    const fixedCorners: Record<string, boolean> = {};
    keyCorners(layout.fixedKeys).map(
        (c) => (fixedCorners[pointToString(c)] = true),
    );
    blockerCorners(layout.fixedBlockers).map(
        (c) => (fixedCorners[pointToString(c)] = true),
    );

    // Make all options overlap within section.
    for (const section of layout.variableSections) {
        // Find section anchor by option with most corners in common with fixed keys.
        let maxCommonCornersOptions: LayoutOption[] = [];
        let maxCommonCorners = 0;
        for (const option of section.options) {
            const optionCorners = keyCorners(option.keys)
                .map(pointToString)
                .concat(blockerCorners(option.blockers).map(pointToString));
            const count = optionCorners
                .map((c) => !!fixedCorners[c])
                .filter(Boolean).length;
            if (count > maxCommonCorners) {
                maxCommonCornersOptions = [option];
                maxCommonCorners = count;
            } else if (count === maxCommonCorners) {
                maxCommonCornersOptions.push(option);
            }
        }

        // Secondary sort to option with key position nearest the center.
        let anchorOption: LayoutOption = maxCommonCornersOptions[0];
        if (maxCommonCornersOptions.length > 1) {
            const fixedCenterOfMass = centerOfMass([
                ...layout.fixedKeys,
                ...layout.fixedBlockers,
            ]);
            let minCenterOfMassDistance: number = Infinity;
            for (const option of maxCommonCornersOptions) {
                const optionCenterOfMass = centerOfMass([
                    ...option.keys,
                    ...option.blockers,
                ]);
                const delta = distance(fixedCenterOfMass, optionCenterOfMass);
                if (delta < minCenterOfMassDistance) {
                    anchorOption = option;
                    minCenterOfMassDistance = delta;
                }
            }
        }

        // Stack all options on top of the anchor option.
        const anchorCenter = centerOfMass([
            ...anchorOption.keys,
            ...anchorOption.blockers,
        ]);
        for (const option of section.options) {
            let optionCenter = centerOfMass([
                ...option.keys,
                ...option.blockers,
            ]);
            // Move all keys within option to overlap with section footprint.
            const diff = subtract(anchorCenter, optionCenter);
            for (const key of option.keys) {
                key.position = add(key.position, diff);
            }
            for (const blocker of option.blockers) {
                blocker.position = add(blocker.position, diff);
            }
        }
    }

    return layout;
};
