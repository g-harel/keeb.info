import color from "color";
import React from "react";

import {Blank} from "../../blank";
import {Box} from "../../box";
import {HexColor} from "../../color";
import {UUID} from "../../identity";
import {genID} from "../../identity";
import {
    BORDER,
    SHELF_PADDING_BOTTOM,
    SHELF_PADDING_TOP,
    calcKeycap,
} from "../../keycap";
import {KeysetKeycapLegends} from "../../keyset";
import {ReactProps} from "../../react";
import {Pooler} from "../view";
import {Legends} from "./legends";
import {Mounts} from "./mounts";

export interface KeyProps extends ReactProps {
    uuid: UUID;
    color: string;
    blank: Blank;
    pooler: Pooler;
    boxes?: Box[];
    stem?: boolean;
    stabs?: boolean;
    legend?: KeysetKeycapLegends;
    noWire?: boolean;
}

export const DETAIL_BORDER = BORDER / 2;

// TODO move and share with blocker
export const STROKE_COLOR_DARKEN = 0.07;
export const STROKE_COLOR_DESATURATE = 0.18;
export const SHELF_COLOR_LIGHTEN = 0.05;
const keyColor = (base: HexColor): [HexColor, HexColor] => {
    const shelfColor = color(base).lighten(SHELF_COLOR_LIGHTEN).hex();
    const strokeColor = color(base)
        .desaturate(STROKE_COLOR_DESATURATE)
        .darken(STROKE_COLOR_DARKEN)
        .hex();
    return [shelfColor, strokeColor];
};

export const Key = (props: KeyProps) => {
    const [shelfColor, strokeColor] = keyColor(props.color);

    const refID = genID("key", {
        base: props.blank.boxes,
        shelf: props.boxes,
        color: props.color,
    });

    const calculatedKeycap = calcKeycap({
        base: props.blank.boxes,
        shelf: props.boxes,
    });
    return (
        <g id={props.uuid}>
            {/* Keycap */}
            {props.pooler(refID, () => (
                <g>
                    {/* Base shape */}
                    <path
                        d={calculatedKeycap.basePath}
                        stroke={strokeColor}
                        strokeWidth={BORDER}
                        fill={props.color}
                    />
                    {/* Base->step arcs */}
                    {calculatedKeycap.baseArcBridges.map((l, i) => (
                        <line
                            key={i}
                            x1={l[0][0]}
                            y1={l[0][1]}
                            x2={l[1][0]}
                            y2={l[1][1]}
                            stroke={strokeColor}
                            strokeWidth={DETAIL_BORDER}
                            strokeLinecap="round"
                        />
                    ))}
                    {/* Step shapes */}
                    {calculatedKeycap.stepPaths.map((path, i) => (
                        <path
                            key={i}
                            d={path}
                            stroke={strokeColor}
                            strokeWidth={BORDER}
                            fill={props.color}
                            strokeLinejoin="round"
                        />
                    ))}
                    {/* Step->shelf arcs */}
                    {calculatedKeycap.shelfArcBridges.map((l, i) => (
                        <line
                            key={i}
                            x1={l[0][0]}
                            y1={l[0][1]}
                            x2={l[1][0]}
                            y2={l[1][1]}
                            stroke={strokeColor}
                            strokeWidth={DETAIL_BORDER}
                            strokeLinecap="round"
                        />
                    ))}
                    {/* Shelf shape */}
                    <path
                        d={calculatedKeycap.shelfPath}
                        stroke={strokeColor}
                        strokeWidth={BORDER}
                        fill={shelfColor}
                    />
                </g>
            ))}

            {/* Mounts */}
            <Mounts
                pooler={props.pooler}
                blank={props.blank}
                offset={(SHELF_PADDING_TOP - SHELF_PADDING_BOTTOM) / 2}
                color={props.color}
                stem={props.stem}
                stabs={props.stabs}
                noWire={props.noWire}
            />

            {/* Legends */}
            {props.legend && (
                <Legends
                    backupColor={strokeColor}
                    container={calculatedKeycap.topLegendBox}
                    layout={props.legend.topLegends}
                    pooler={props.pooler}
                />
            )}
            {props.legend && (
                <Legends
                    backupColor={strokeColor}
                    container={calculatedKeycap.frontLegendBox}
                    layout={props.legend.frontLegends}
                    pooler={props.pooler}
                />
            )}
        </g>
    );
};
