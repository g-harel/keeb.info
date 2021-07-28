import React from "react";

import {Shape} from "../../internal/types/base";
import {ReactProps} from "../../internal/types/util";

export interface StrokeShapeProps extends ReactProps {
    shape: Shape[];
    borderWidth: number;
    // Like CSS: top, right, bottom, left.
    padding: [number, number, number, number];
    fillColor: string;
    strokeColor: string;
    radius: number;
}

export const StrokeShape = (props: StrokeShapeProps) => {
    const innerStroke = Math.max(0, props.radius - props.borderWidth);
    return (
        <>
            {props.shape.map((shape, i) => (
                // Stroke.
                <rect
                    key={`stroke-${i}`}
                    fill={props.strokeColor}
                    x={shape.offset[0] + props.padding[3]}
                    y={shape.offset[1] + props.padding[0]}
                    rx={props.radius}
                    width={shape.width - props.padding[1] - props.padding[3]}
                    height={shape.height - props.padding[0] - props.padding[2]}
                />
            ))}
            {props.shape.map((shape, i) => (
                // Fill.
                <rect
                    key={`fill-${i}`}
                    fill={props.fillColor}
                    x={shape.offset[0] + props.padding[3] + props.borderWidth}
                    y={shape.offset[1] + props.padding[0] + props.borderWidth}
                    rx={innerStroke}
                    width={
                        shape.width -
                        props.padding[1] -
                        props.padding[3] -
                        2 * props.borderWidth
                    }
                    height={
                        shape.height -
                        props.padding[0] -
                        props.padding[2] -
                        2 * props.borderWidth
                    }
                />
            ))}
        </>
    );
};
