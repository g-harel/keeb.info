import {Serial, Key as KLEKey} from "@ijprest/kle-serial";

import {
    Blank,
    Shape,
    Stabilizer,
    Keyset,
    Layout,
    Cartesian,
    Angle,
} from "./types/base";

export const converKLEKey = (key: KLEKey): Blank => {
    const shapes: Shape[] = [];
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
            angle: [false, false],
            length: shapes[0].width - 1,
            offset: [0.5, 0.5],
        });
    } else if (shapes[0].height >= 2) {
        stabilizers.push({
            angle: [true, true],
            length: shapes[0].height - 1,
            offset: [0.5, 0.5],
        });
    }

    return {
        shape: shapes,
        stabilizers,
        // Assume centered all the time.
        stem: [key.width / 2, key.height / 2],
    };
};

export const convertKLEToLayout = (raw: any): Layout => {
    const kle = Serial.deserialize(raw);

    return {
        ref: String(Math.random()),
        fixedBlockers: [],
        fixedKeys: kle.keys.map((key) => {
            return {
                ref: String(Math.random()),
                key: converKLEKey(key),
                position: [key.x, key.y],
                angle: key.rotation_angle,
                orientation: [true, false],
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
                    const blank = converKLEKey(key);
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
