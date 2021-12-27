import React from "react";
import styled from "styled-components";

import {ReactProps} from "../../internal/react";

const StyledWrapper = styled.div`
    align-items: center;
    color: lightcoral;
    display: flex;
    flex-grow: 1;
    justify-content: center;
    padding: 2rem;
`;

const StyledTextWrapper = styled.div`
    h1 {
        font-size: 4rem;
    }

    p {
        font-size: 1rem;
    }

    h1,
    p {
        margin: 0;
        text-align: center;
    }
`;

export interface MessageProps extends ReactProps {
    banner: string;
    message: string;
}

export const Message = (props) => (
    <StyledWrapper>
        <StyledTextWrapper>
            <h1>{props.banner}</h1>
            <p>{props.message}</p>
        </StyledTextWrapper>
    </StyledWrapper>
);
