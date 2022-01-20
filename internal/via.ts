import {Serial} from "@ijprest/kle-serial";

import {convertKLEKey} from "./kle";
import {Layout, LayoutKey, LayoutSection, stackSections} from "./layout";

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

export const convertViaToLayout = (definition: ViaDefinition): Layout => {
    const kle = Serial.deserialize(definition.layouts.keymap);

    // Collect keys and sections.
    // There is no need to consider blockers since they are not generated.
    // TODO handle decals/blockers
    // TODO add labels to things instead of using refs
    const fixedKeys: LayoutKey[] = [];
    const variableSections: LayoutSection[] = [];
    for (const key of kle.keys) {
        if (key.labels[8]) {
            const [sectionIndex, optionIndex] = key.labels[8]
                .split(",")
                .map(Number);

            // Create required sections.
            while (variableSections.length <= sectionIndex) {
                variableSections.push({
                    ref: "",
                    options: [],
                });
            }
            let sectionLabel = definition.layouts.labels[sectionIndex];
            if (Array.isArray(sectionLabel)) {
                sectionLabel = sectionLabel[0];
            }
            variableSections[sectionIndex].ref = sectionLabel;

            // Create required options.
            const options = variableSections[sectionIndex].options;
            while (options.length <= optionIndex) {
                options.push({
                    ref: "",
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
            options[optionIndex].ref = optionLabel;

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

    return stackSections({
        ref: definition.name,
        fixedBlockers: [],
        fixedKeys,
        variableSections,
    });
};
