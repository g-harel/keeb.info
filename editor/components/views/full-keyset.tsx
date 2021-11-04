import React from "react";
import * as color from "color";

import {minmaxKeysetKit} from "../../../internal/measure";
import {Keyset, KeysetKit} from "../../../internal/types/base";
import {Key} from "../key";
import {
    DEFAULT_KEY_COLOR,
    MIN_KEYSET_WIDTH_DISPLAY,
    SHINE_PADDING_TOP,
} from "../../cons";
import {ReactProps} from "../../../internal/types/util";
import {Plane, PlaneItem, Pool} from "../plane";
import {Pair} from "polygon-clipping";
import {resolveColor} from "../../../internal/colors";

export interface FullKeysetProps extends ReactProps {
    width: number;
    keyset: Keyset;
}

interface KitBox {
    kit: KeysetKit;
    width: number;
    height: number;
    min: Pair;
}

const sum = (nums: number[]): number => {
    return nums.reduce((sum, num) => sum + num, 0);
};

// TODO kit name/spacing.
export const FullKeyset = (props: FullKeysetProps) => {
    // Calculate bounding boxes for all kits.
    const kits: KitBox[] = [];
    for (const kit of props.keyset.kits) {
        const [min, max] = minmaxKeysetKit(kit);
        kits.push({
            kit,
            width: max[0] - min[0],
            height: max[1] - min[1],
            min,
        });
    }

    // Place kits into rows.
    let maxWidth = MIN_KEYSET_WIDTH_DISPLAY;
    for (const kit of kits) {
        maxWidth = Math.max(maxWidth, kit.width);
    }
    const kitRows: KitBox[][] = [[]];
    for (const kit of kits) {
        const lastRow = kitRows[kitRows.length - 1];
        const currentWidth = sum(lastRow.map((i) => i.width));
        if (currentWidth + kit.width <= maxWidth) {
            lastRow.push(kit);
        } else {
            kitRows.push([kit]);
        }
    }

    // Extract each row's height.
    const rowHeights: number[] = [];
    for (const row of kitRows) {
        let max = 0;
        for (const kit of row) {
            max = Math.max(max, kit.height);
        }
        rowHeights.push(max);
    }

    const pool = new Pool();
    return (
        <Plane
            pixelWidth={props.width}
            unitSize={[maxWidth, sum(rowHeights)]}
            pool={pool}
            padTop={-Math.min(0, SHINE_PADDING_TOP)}
        >
            {kitRows.map((row, i) => {
                const startY = sum(rowHeights.slice(0, i));
                return row.map((kit, j) => {
                    const startX = sum(row.slice(0, j).map(({width}) => width));
                    return kit.kit.keys.map((key, k) => (
                        <PlaneItem
                            key={`${props.keyset.name}-${i}-${j}-${k}`}
                            origin={[kit.min[0] + startX, kit.min[1] + startY]}
                            angle={0}
                            position={[
                                key.position[0] + 2 * startX,
                                key.position[1] + 2 * startY,
                            ]}
                        >
                            <Key
                                pool={pool}
                                blank={key.key}
                                color={resolveColor(
                                    key.color || DEFAULT_KEY_COLOR,
                                )}
                                shelf={(key as any).shelf || []}
                                legend={key.legend}
                                stem
                                stabs
                                noWire
                            />
                        </PlaneItem>
                    ));
                });
            })}
        </Plane>
    );
};
