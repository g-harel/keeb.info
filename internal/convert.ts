import {Serial} from "@ijprest/kle-serial";
import {Shape} from "./types/base";

import {Layout} from "./types/layout";

export const convertKLE = (raw: any): Layout => {
    const kle = Serial.deserialize(raw);

    return {
        fixedKeys: kle.keys.map((key) => {
            const shapes: Shape[] = [];
            shapes.push({
                height: key.height,
                width: key.width,
                offset: {x: 0, y: 0},
            });

            const isSmall = key.width2 === 0 || key.height2 === 0;
            const isResized =
                key.width2 !== key.width || key.height2 !== key.height;
            const isMoved = key.x2 !== 0 || key.y2 !== 0;
            const hasSecond = !isSmall && (isMoved || isResized);
            if (hasSecond) {
                shapes.push({
                    height: key.height2,
                    width: key.width2,
                    offset: {x: key.x2, y: key.y2},
                });
            }

            return {
                key: {
                    shape: shapes,
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
                matrixRow: 0,
                matrixColumn: 0,
            };
        }),
        options: [],
    };
};
