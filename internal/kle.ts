import {Key, Serial} from "@ijprest/kle-serial";
import color from "color";
import {v4 as uuid} from "uuid";

import {Blank, Stabilizer} from "./blank";
import {Box} from "./box";
import {UUID} from "./identity";
import {KeymapKey, LayoutKeymap} from "./keymap";
import {Keyset, KeysetKeycapLegend} from "./keyset";
import {Layout} from "./layout";

export type KLEKey = Key;

// TODO support decals?
export const convertKLEKey = (key: KLEKey): Blank => {
    const boxes: Box[] = [];
    boxes.push({
        height: key.height,
        width: key.width,
        offset: [0, 0],
    });

    // Add second shape when required.
    const isMicro = key.width2 === 0 || key.height2 === 0;
    const isResized = key.width2 !== key.width || key.height2 !== key.height;
    const isMoved = key.x2 !== 0 || key.y2 !== 0;
    const hasSecond = !isMicro && (isMoved || isResized);
    if (hasSecond) {
        boxes.push({
            height: key.height2,
            width: key.width2,
            offset: [key.x2, key.y2],
        });
    }

    // Infer stabilizers.
    const stabilizers: Stabilizer[] = [];
    if (boxes[0].width >= 2) {
        stabilizers.push({
            angle: 0,
            length: boxes[0].width - 1,
            offset: [0.5, 0.5],
        });
    } else if (boxes[0].height >= 2) {
        stabilizers.push({
            angle: 90,
            length: boxes[0].height - 1,
            offset: [0.5, 0.5],
        });
    }

    const resizedStabilizers: Stabilizer[] = stabilizers.map((stab) => {
        console.log(stab.length);
        const actualLength =
            stab.length > 6 ? 6 : stab.length > 5.25 ? 5.25 : 1;
        const offsetOffset = (stab.length - actualLength) / 2;
        return {
            angle: stab.angle,
            length: actualLength,
            offset: [stab.offset[0] + offsetOffset, stab.offset[1]],
        };
    });

    return {
        boxes: boxes,
        stabilizers: resizedStabilizers,
        // Assume centered all the time.
        stem: [key.width / 2, key.height / 2],
    };
};

export const convertKLEToLayoutKeymap = (raw: any): [Layout, LayoutKeymap] => {
    const kle = Serial.deserialize(raw);
    const layoutRef = uuid();

    const keymap: Record<UUID, KeymapKey> = {};
    const legend = (
        key: KLEKey,
        index: number,
        size: number,
    ): KeysetKeycapLegend => {
        return {
            text: key.labels[index] || "",
            size: size,
            color: color(key.textColor[index] || key.default.textColor)
                .lighten(0.4)
                .hex(),
        };
    };
    return [
        {
            ref: layoutRef,
            label: uuid(),
            fixedBlockers: [],
            fixedKeys: kle.keys.map((key) => {
                const keyRef = uuid();
                if (key.width !== 1) {
                    key.labels[8] = String(key.width);
                    key.textColor[8] = "#444444";
                }
                if (key.color === "#cccccc") {
                    key.color = "#ededed";
                }
                keymap[keyRef] = {
                    tapKeycode: {},
                    holdKeycode: {},
                    color: key.color,
                    legends: {
                        topLegends: [
                            [
                                legend(key, 0, 0.61),
                                legend(key, 1, 0.61),
                                legend(key, 2, 0.61),
                            ],
                            [
                                legend(key, 3, 0.61),
                                legend(key, 4, 0.83),
                                legend(key, 5, 0.61),
                            ],
                            [
                                legend(key, 6, 0.61),
                                legend(key, 7, 0.61),
                                legend(key, 8, 0.61),
                            ],
                        ],
                        frontLegends: [
                            [
                                legend(key, 9, 0.61),
                                legend(key, 10, 0.61),
                                legend(key, 11, 0.61),
                            ],
                        ],
                    },
                };
                return {
                    ref: keyRef,
                    blank: convertKLEKey(key),
                    position: [key.x, key.y],
                    angle: key.rotation_angle,
                    orientation: 270,
                };
            }),
            variableSections: [],
        },
        {
            layout: layoutRef,
            layers: [keymap],
            optionSelection: [],
        },
    ];
};

export const convertKLEToLayout = (raw: any): Layout => {
    const kle = Serial.deserialize(raw);

    return {
        ref: uuid(),
        label: uuid(),
        fixedBlockers: [],
        fixedKeys: kle.keys.map((key) => {
            return {
                ref: uuid(),
                blank: convertKLEKey(key),
                position: [key.x, key.y],
                angle: key.rotation_angle,
                orientation: 270,
            };
        }),
        variableSections: [],
    };
};

export const convertKLEToKeysetKit = (raw: any): Keyset => {
    const kle = Serial.deserialize(raw);

    return {
        id: {
            vendorID: uuid(),
            productID: uuid(),
        },
        name: uuid(),
        kits: [
            {
                id: {
                    vendorID: uuid(),
                    productID: uuid(),
                },
                name: uuid(),
                keys: kle.keys.map((key) => {
                    const blank = convertKLEKey(key);
                    return {
                        blank: blank,
                        shelf: blank.boxes.length > 1 ? [blank.boxes[0]] : [],
                        profile: {
                            profile: uuid(),
                            row: "R1",
                        },
                        legend: {
                            frontLegends: [],
                            topLegends: [],
                            keycodeAffinity: [],
                        },
                        position: [key.x, key.y],
                        barred: false,
                        scooped: false,
                        stem: "Cherry",
                        keycodeAffinity: [],
                    };
                }),
            },
        ],
    };
};
