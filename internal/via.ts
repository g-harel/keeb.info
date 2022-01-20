import {Serial} from "@ijprest/kle-serial";

import {corners} from "./box";
import {convertKLEKey} from "./kle";
import {Layout, LayoutKey, LayoutOption, LayoutSection} from "./layout";
import {Point, add, distance, subtract} from "./point";

export interface ViaDefinition {
    name: string;
    productId: string; // TODO hex number
    vendorId: string; // TODO hex number
    firmwareVersion: number;
    keycodes: string[]; // TODO enum
    matrix: {rows: number; cols: number};
    menus: string[]; // TODO enum
    layouts: {
        labels: (string | string[])[];
        keymap: any; // KLE
    };
}

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

export const convertViaToLayout = (definition: ViaDefinition): Layout => {
    const kle = Serial.deserialize(definition.layouts.keymap);

    // Collect keys and sections.
    // There is no need to consider blockers since they are not generated.
    // TODO handle decals/blockers
    const fixedKeys: LayoutKey[] = [];
    const variableSections: LayoutSection[] = [];
    for (const key of kle.keys) {
        if (key.labels[8]) {
            const [sectionIndex, optionIndex] = key.labels[8]
                .split(",")
                .map(Number);

            // Create required sections/options.
            while (variableSections.length <= sectionIndex) {
                variableSections.push({
                    ref: String(Math.random()),
                    options: [],
                });
            }
            const options = variableSections[sectionIndex].options;
            while (options.length <= optionIndex) {
                options.push({
                    ref: String(Math.random()),
                    blockers: [],
                    keys: [],
                });
            }

            const option = options[optionIndex];
            option.keys.push({
                ref: String(Math.random()),
                blank: convertKLEKey(key),
                position: [key.x, key.y],
                angle: key.rotation_angle,
                orientation: 270,
            });

            continue;
        }

        fixedKeys.push({
            ref: String(Math.random()),
            blank: convertKLEKey(key),
            position: [key.x, key.y],
            angle: key.rotation_angle,
            orientation: 270,
        });
    }

    // Collect all corners from fixed keys.
    const fixedKeyCorners: Record<string, boolean> = {};
    keyCorners(fixedKeys).map(
        (c) => (fixedKeyCorners[pointToString(c)] = true),
    );

    // Make all options overlap within section.
    for (const section of variableSections) {
        // Find section anchor by option with most corners in common with fixed keys.
        // When there is a tie, all tied sections will be included in origin search.
        let sectionAnchor: Point = [0, 0];
        let maxCommonCornersOptions: LayoutOption[] = [];
        let maxCommonCorners = 0;
        for (const option of section.options) {
            const optionCorners = keyCorners(option.keys).map(pointToString);
            const count = optionCorners
                .map((c) => !!fixedKeyCorners[c])
                .filter(Boolean).length;
            if (count > maxCommonCorners) {
                maxCommonCornersOptions = [option];
                maxCommonCorners = count;
            } else if (count === maxCommonCorners) {
                maxCommonCornersOptions.push(option);
            }
        }
        // Fallback to key position nearest the origin.
        let minSectionAnchorDistance: number = Infinity;
        for (const option of maxCommonCornersOptions) {
            for (const key of option.keys) {
                const delta = distance(key.position, [0, 0]);
                if (delta < minSectionAnchorDistance) {
                    sectionAnchor = key.position;
                    minSectionAnchorDistance = delta;
                }
            }
        }

        // TODO fix when option is to the left of anchor.
        // TODO don't assume X/Y invariant was followed.
        for (const option of section.options) {
            // Find each option's anchor by finding nearest one to the section anchor.
            // Because options are only moved horizontally or vertically, the nearest
            // position to the section anchor should be the option anchor.
            let optionAnchor: Point = [0, 0];
            let minOptionAnchorDistance: number = Infinity;
            for (const key of option.keys) {
                const delta = distance(key.position, sectionAnchor);
                if (delta < minOptionAnchorDistance) {
                    optionAnchor = key.position;
                    minOptionAnchorDistance = delta;
                }
            }

            // Move all keys within option to overlap with section footprint.
            const diff = subtract(sectionAnchor, optionAnchor);
            for (const key of option.keys) {
                key.position = add(key.position, diff);
            }
        }
    }

    return {
        ref: String(Math.random()),
        fixedBlockers: [],
        fixedKeys,
        variableSections,
    };
};
