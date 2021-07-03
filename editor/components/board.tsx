import React, {useState} from "react";
import styled from "styled-components";

import {minmax} from "../../internal/layout";
import {Coord} from "../../internal/types/base";
import {Layout} from "../../internal/types/layout";
import {Key} from "./key";

export interface IProps {
    width: number;
    layout: Layout;
}

const Wrapper = styled.div<IProps>`
    padding: 10px;

    /* 1u */
    font-size: 2rem;
`;

const KeyTransform = styled.div`
    position: relative;
    width: 0;
    height: 0;
`;

export const Board: React.FunctionComponent<IProps> = ({layout, width}) => {
    const [min, max] = minmax(layout);
    const unitWidth = max.x - min.x;
    const unitHeight = max.y - min.y;
    const unit = width / unitWidth;

    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const toggleSelected = (id: number) => () => {
        setSelected(Object.assign({}, selected, {[id]: !selected[id]}));
    };

    return (
        <Wrapper
            style={{
                width: unitWidth + "em",
                height: unitHeight + "em",
                fontSize: unit + "px",
            }}
        >
            {layout.fixedKeys.map((fixedKey, i) => {
                const origin: Coord = {
                    x: -fixedKey.position.x + min.x,
                    y: -fixedKey.position.y + min.y,
                };
                return (
                    <KeyTransform
                        key={i}
                        style={{
                            left: fixedKey.position.x - min.x + "em",
                            top: fixedKey.position.y - min.y + "em",
                            transform: `rotate(${fixedKey.angle}deg)`,
                            transformOrigin: `${origin.x}em ${origin.y}em`,
                        }}
                    >
                        <Key
                            blank={fixedKey.key}
                            onClick={toggleSelected(i)}
                            selected={selected[i]}
                        />
                    </KeyTransform>
                );
            })}
        </Wrapper>
    );
};
