import React from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";

const StyledHeader = styled.header`
    display: flex;
    flex-direction: row;
    height: 2rem;
    border-bottom: 1px solid pink;
`;

export const Header = () => {
    return (
        <StyledHeader>
            <Link to="/">Home</Link>
            <Link to="/account">Account</Link>
        </StyledHeader>
    );
};
