import {Serial} from "@ijprest/kle-serial";

import {Layout} from "./types/layout";

export const convertKLE = (raw: any): Layout => {
    const kle = Serial.deserialize(raw);

    return {
        fixedKeys: kle.keys.map((key) => ({
                key: {
                    shape: [{
                        height: key.height,
                        width: key.width,
                        offset: {x: 0, y: 0},
                    }],
                    stabilizers: [],
                    // Assume centered all the time.
                    stem: {
                        x: key.x + key.width / 2,
                        y: key.y + key.height / 2,
                    },
                },
                position: {
                    x: key.x,
                    y: key.y,
                },
                angle: key.rotation_angle,
            })),
        options: [],
    };
};
