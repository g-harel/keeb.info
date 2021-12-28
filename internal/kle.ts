import {Key, Serial} from "@ijprest/kle-serial";
import color from "color";

import {Blank, Stabilizer} from "./blank";
import {KeymapKey, LayoutKeymap} from "./keymap";
import {Keyset, KeysetKeycapLegend} from "./keyset";
import {Layout} from "./layout";
import {Box} from "./measure";
import {UUID} from "./units";

// TODO support decals
const convertKLEKey = (key: Key): Blank => {
    const shapes: Box[] = [];
    shapes.push({
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
        shapes.push({
            height: key.height2,
            width: key.width2,
            offset: [key.x2, key.y2],
        });
    }

    // Infer stabilizers.
    const stabilizers: Stabilizer[] = [];
    if (shapes[0].width >= 2) {
        stabilizers.push({
            angle: 0,
            length: shapes[0].width - 1,
            offset: [0.5, 0.5],
        });
    } else if (shapes[0].height >= 2) {
        stabilizers.push({
            angle: 90,
            length: shapes[0].height - 1,
            offset: [0.5, 0.5],
        });
    }

    // TODO legends.

    return {
        shape: shapes,
        stabilizers,
        // Assume centered all the time.
        stem: [key.width / 2, key.height / 2],
    };
};

export const convertKLEToLayoutKeymap = (raw: any): [Layout, LayoutKeymap] => {
    const kle = Serial.deserialize(raw);
    const layoutRef = String(Math.random());

    const keymap: Record<UUID, KeymapKey> = {};
    const legend = (
        key: Key,
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
            fixedBlockers: [],
            fixedKeys: kle.keys.map((key) => {
                const keyRef = String(Math.random());
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
                        // TODO front legends
                        frontLegends: [],
                    },
                };
                return {
                    ref: keyRef,
                    key: convertKLEKey(key),
                    position: [key.x, key.y],
                    angle: key.rotation_angle,
                    orientation: 270,
                };
            }),
            variableKeys: [],
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
        ref: String(Math.random()),
        fixedBlockers: [],
        fixedKeys: kle.keys.map((key) => {
            return {
                ref: String(Math.random()),
                key: convertKLEKey(key),
                position: [key.x, key.y],
                angle: key.rotation_angle,
                orientation: 270,
            };
        }),
        variableKeys: [],
    };
};

export const convertKLEToKeysetKit = (raw: any): Keyset => {
    const kle = Serial.deserialize(raw);

    return {
        id: {
            vendorID: String(Math.random()),
            productID: String(Math.random()),
        },
        name: String(Math.random()),
        kits: [
            {
                id: {
                    vendorID: String(Math.random()),
                    productID: String(Math.random()),
                },
                name: String(Math.random()),
                keys: kle.keys.map((key) => {
                    const blank = convertKLEKey(key);
                    return {
                        key: blank,
                        shelf: blank.shape.length > 1 ? [blank.shape[0]] : [],
                        profile: {
                            profile: String(Math.random()),
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
