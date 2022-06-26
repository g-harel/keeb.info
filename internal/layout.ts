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
import {Possible, isErr, isErrOfType, newErr} from "./possible";
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

    // Human-readable description of the layout.
    label: string;

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

    // Human-readable description of the section.
    label: string;

    // Options available for the section.
    // All options should overlap exactly.
    options: LayoutOption[];
}

// Key placement options for an overlapping section of the layout.
export interface LayoutOption {
    // Unique identifier to refer to the option.
    ref: UUID;

    // Human-readable description of the option.
    label: string;

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

const PAD = 0.45;
const SEARCH_RESOLUTION = 0.015;
const SEARCH_JUMP = 5;
const SEARCH_MAX_ATTEMPTS = 1000;
const SEARCH_CLOSE_RANGE = 0.2;
const SEARCH_CLOSE_JUMP = 0.02;
const SEARCH_CLOSE_MAX_ATTEMPTS = 10;
const ERR_ILLEGAL_ARGUMENTS = newErr("invalid arguments");

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
        sectionEntities = sectionEntities
            .concat(section.options[0].keys)
            .concat(section.options[0].blockers);
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

// TODO 2022-06-21 move to a util file + document + test.
const binarySearch = (
    min: number,
    max: number,
    jump: number,
    resolution: number,
    maxAttempts: number,
    tooSmall: (inc: number) => boolean,
): Possible<number> => {
    // Validate jump makes sense.
    if (min + jump > max) {
        return ERR_ILLEGAL_ARGUMENTS.describe(
            `jump exceeds search area (${jump} > ${max} - ${min})`,
        );
    }

    if (max !== Infinity && tooSmall(max)) {
        return newErr("max exceeded");
    }

    // Use jump repeatedly to find initial window.
    let start = min;
    let end = min + jump;
    while (tooSmall(end)) {
        if (end > max) return newErr("max exceeded");
        start = end;
        end += jump;
    }

    // Use binary search to find first increment within resolution.
    let prevAttempt = 0;
    for (let i = 0; i < maxAttempts; i++) {
        // Calculate new attempt and return if within resolution.
        const attempt = start + (end - start) / 2;
        if (Math.abs(prevAttempt - attempt) < resolution) return prevAttempt;
        prevAttempt = attempt;

        const attemptTooSmall = tooSmall(attempt);
        if (attemptTooSmall) {
            start = attempt;
        } else {
            end = attempt;
        }
    }

    return newErr("binary search failed, too many attempts");
};

export interface SpreadResult {
    offsets: Record<UUID, Point>;
    errors: Record<UUID, string>;
}

// TODO 2022-06-25 demo layout is broken now.
export const spreadSectionsOffsets = (layout: Layout): SpreadResult => {
    const offsets: Record<UUID, Point> = {};
    const errors: Record<UUID, string> = {};
    let avoid = layoutFootprint(layout, PAD);

    for (const section of layout.variableSections) {
        const firstOption = section.options[0];
        offsets[firstOption.ref] = [0, 0];
        avoid = multiUnion(
            ...avoid,
            ...firstOption.keys.map(toComposite).flat(1),
            ...firstOption.blockers.map(toComposite).flat(1),
        );
    }

    for (const section of orderVertically(layout.variableSections)) {
        const canonicalFootprint = optionFootprint(section.options[0]);

        let previousIncrement = 0;
        for (const option of section.options.slice(1)) {
            // Validate overlap and reject broken section options.
            if (!equalComposite(canonicalFootprint, optionFootprint(option))) {
                errors[
                    option.ref
                ] = `invalid overlap for option: ${layout.label}, ${section.label}, ${option.label}`;
                continue;
            }

            const doesOptionIntersect = (inc: number): boolean => {
                const offsetAmount: Point = [0, inc];
                let intersects = false;

                // Check if any key intersects.
                for (const key of option.keys) {
                    const s = toComposite(offset(offsetAmount)(key));
                    if (doesIntersect(avoid, s)) {
                        intersects = true;
                        break;
                    }
                }
                if (intersects) return true;

                // Check if blocker intersects.
                for (const blocker of option.blockers) {
                    const s = toComposite(offset(offsetAmount)(blocker));
                    if (doesIntersect(avoid, s)) {
                        intersects = true;
                        break;
                    }
                }
                return intersects;
            };

            // Search near the previous increment
            let increment = binarySearch(
                previousIncrement + 1,
                previousIncrement + 1 + SEARCH_CLOSE_RANGE,
                SEARCH_CLOSE_JUMP,
                SEARCH_RESOLUTION,
                SEARCH_CLOSE_MAX_ATTEMPTS,
                doesOptionIntersect,
            );
            if (isErrOfType(increment, ERR_ILLEGAL_ARGUMENTS)) {
                console.error(increment.err.print());
            }

            // Close binary search failed, search from scratch.
            if (isErr(increment)) {
                increment = binarySearch(
                    previousIncrement,
                    Infinity,
                    SEARCH_JUMP,
                    SEARCH_RESOLUTION,
                    SEARCH_MAX_ATTEMPTS,
                    doesOptionIntersect,
                );
                if (isErr(increment)) {
                    // TODO 2022-06-19 float up errors to final ui
                    errors[option.ref] = increment.err
                        .describe(
                            `spread failed for option: ${layout.label}, ${section.label}, ${option.label}`,
                        )
                        .print();
                    continue;
                }
            }
            previousIncrement = increment;

            const newComposites: Composite[] = [];
            for (const key of option.keys) {
                const copy = Object.assign({}, key);
                copy.position = add(copy.position, [0, increment]);
                newComposites.push(toComposite(copy));
            }
            for (const blocker of option.blockers) {
                const copy = Object.assign({}, blocker);
                copy.position = add(copy.position, [0, increment]);
                newComposites.push(toComposite(copy));
            }

            // Modify option with correct increment and update avoided area.
            offsets[option.ref] = [0, increment];
            avoid = multiUnion(...avoid, ...newComposites.flat(1));
        }
    }

    return {offsets, errors};
};

// TODO return possible
// TODO 2022-06-19 do this at compile time and return offsets instead of transformed layout
export const spreadSections = (layout: Layout): Layout => {
    const out: Layout = deepCopy(layout);
    const {offsets, errors} = spreadSectionsOffsets(layout);
    for (const section of out.variableSections) {
        for (const option of section.options) {
            if (errors[option.ref]) {
                console.error(errors[option.ref]);
                option.keys = [];
                option.blockers = [];
                continue;
            }
            if (!offsets[option.ref]) {
                console.error(
                    "Missing offset",
                    out.label,
                    section.label,
                    option.label,
                );
                continue;
            }
            for (const key of option.keys) {
                key.position = add(key.position, offsets[option.ref]);
            }
            for (const blocker of option.blockers) {
                blocker.position = add(blocker.position, offsets[option.ref]);
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
