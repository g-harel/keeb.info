import React, {useEffect, useState} from "react";
import "requestidlecallback";
import styled, {keyframes} from "styled-components";

import {ReactProps} from "../../internal/react";
import {theme} from "../internal/theme";

export interface DeferProps extends ReactProps {
    width?: string;
    height?: string;
}

const breatheAnimation = keyframes`
    0% {opacity: 0.08}
    50% {opacity: 0.16}
    100% {opacity: 0.08}
`;

const Placeholder = styled.div<DeferProps>`
    background-color: ${theme.colors.sub};
    border-radius: 1em;
    height: ${({height}) => height};
    width: ${({width}) => width};
    animation-name: ${breatheAnimation};
    animation-duration: 2s;
    animation-iteration-count: infinite;
`;

export const Defer = (props: DeferProps) => {
    const [render, setRender] = useState(false);

    useEffect(() => {
        const id = window.requestIdleCallback(() => setRender(true));
        return () => window.cancelIdleCallback(id);
    }, []);

    if (render) return <>{props.children}</>;

    return <Placeholder width={props.width} height={props.height} />;
};
