import color from "color";
import React from "react";
import {Link} from "react-router-dom";
import styled from "styled-components";

import {Logo} from "./logo";

const StyledHeader = styled.header`
    align-items: center;
    background-color: pink;
    border-bottom: 2px solid lightpink;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    height: 3rem;
    justify-content: space-between;
    padding: 0 0.5rem;
`;

const StyledLogoLink = styled(Link)`
    border-radius: 0.2rem;
    height: 2rem;
    padding: 0.2rem;
    text-decoration: none;

    :hover {
        background-color: lightpink;
    }

    :active {
        opacity: 0.8;
    }
`;

const StyledTextLink = styled(Link)`
    font-weight: bold;
    text-decoration: none;
    text-transform: uppercase;
    padding: 0.5rem;
    background-color: ${color("#a7e7f0").hex()};
    color: ${color("#a7e7f0").darken(0.5).hex()};
    font-size: 0.8rem;
    border-radius: 0.25rem;
    border: 1px solid ${color("#a7e7f0").darken(0.1).hex()};
`;

export const Header = () => {
    return (
        <StyledHeader>
            <StyledLogoLink to="/">
                <Logo color="lightcoral" size="2rem" />
            </StyledLogoLink>
            <StyledTextLink to="/account">Profile</StyledTextLink>
        </StyledHeader>
    );
};
