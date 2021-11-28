import React from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";

import {Logo} from "./components/Logo";

const StyledHeader = styled.header`
    align-items: center;
    border-bottom: 2px solid lightpink;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    height: 3rem;
    justify-content: space-between;
    background-color: pink;
`;

const StyledLogoLink = styled(Link)`
    padding: 0.2rem;
    border-radius: 0.2rem;
    margin-left: 0.5rem;

    :hover {
        background-color: lightpink;
    }

    :active {
        opacity: 0.8;
    }
`;

export const Header = () => {
    return (
        <StyledHeader>
            <StyledLogoLink to="/">
                <Logo color="lightcoral" size="2rem" />
            </StyledLogoLink>
            <Link to="/account">Account</Link>
        </StyledHeader>
    );
};
