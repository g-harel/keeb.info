import {Serial} from "@ijprest/kle-serial";
import {v4 as uuid} from "uuid";

import {convertKLEKey} from "./kle";
import {
    Layout,
    LayoutBlocker,
    LayoutKey,
    LayoutSection,
    stackSections,
} from "./layout";

export interface ViaDefinition {
    name: string;
    productId: string; // TODO hex number
    vendorId: string; // TODO hex number
    firmwareVersion?: number;
    keycodes?: string[]; // TODO enum
    matrix: {rows: number; cols: number};
    menus?: string[]; // TODO enum
    layouts: {
        labels: (string | string[])[];
        keymap: any; // KLE
    };
}

export const convertViaToLayout = (definition: ViaDefinition): Layout => {
    const kle = Serial.deserialize(definition.layouts.keymap);

    // Collect keys and sections.
    // TODO flag that pole/stab positions are guessed
    const fixedKeys: LayoutKey[] = [];
    const fixedBlockers: LayoutBlocker[] = [];
    const variableSections: LayoutSection[] = [];
    for (const key of kle.keys) {
        const isEmpty = !!key.decal;

        if (key.labels[8]) {
            const [sectionIndex, optionIndex] = key.labels[8]
                .split(",")
                .map(Number);

            // Create required sections.
            while (variableSections.length <= sectionIndex) {
                variableSections.push({
                    ref: uuid(),
                    label: "",
                    options: [],
                });
            }
            let sectionLabel = definition.layouts.labels[sectionIndex];
            if (Array.isArray(sectionLabel)) {
                sectionLabel = sectionLabel[0];
            }
            variableSections[sectionIndex].label = sectionLabel;

            // Create required options.
            const options = variableSections[sectionIndex].options;
            while (options.length <= optionIndex) {
                options.push({
                    ref: uuid(),
                    label: "",
                    blockers: [],
                    keys: [],
                });
            }
            let optionLabel = definition.layouts.labels[sectionIndex];
            if (Array.isArray(optionLabel)) {
                optionLabel = optionLabel[optionIndex];
            } else {
                optionLabel = String(optionIndex);
            }
            options[optionIndex].label = optionLabel;

            const option = options[optionIndex];
            if (isEmpty) {
                option.blockers.push({
                    ref: uuid(),
                    boxes: convertKLEKey(key).boxes,
                    label: "covered",
                    position: [key.x, key.y],
                    angle: key.rotation_angle,
                });
            } else {
                option.keys.push({
                    ref: uuid(),
                    blank: convertKLEKey(key),
                    position: [key.x, key.y],
                    angle: key.rotation_angle,
                    orientation: 270,
                });
            }

            continue;
        }

        if (isEmpty) {
            fixedBlockers.push({
                ref: uuid(),
                boxes: convertKLEKey(key).boxes,
                label: "covered",
                position: [key.x, key.y],
                angle: key.rotation_angle,
            });
        } else {
            fixedKeys.push({
                ref: uuid(),
                blank: convertKLEKey(key),
                position: [key.x, key.y],
                angle: key.rotation_angle,
                orientation: 270,
            });
        }
    }

    return stackSections({
        ref: uuid(),
        label: definition.name,
        fixedBlockers,
        fixedKeys,
        variableSections,
    });
};
