import React from "react";
import styled from "styled-components";
import {Link} from "react-router-dom";

import {Logo} from "./logo";

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

const StyledLink = styled(Link)`
    border-radius: 0.2rem;
    height: 2rem;
    margin: 0 0.5rem;
    padding: 0.2rem;
    text-decoration: none;

    :hover {
        background-color: lightpink;
    }

    :active {
        opacity: 0.8;
    }
`;

const StyledLinkText = styled.div`
    color: lightcoral;
    font-weight: bold;
    text-decoration: none;
    padding: 0.5rem;
`;

export const Header = () => {
    return (
        <StyledHeader>
            <StyledLink to="/">
                <Logo color="lightcoral" size="2rem" />
            </StyledLink>
            <StyledLink to="/account">
                <StyledLinkText>
                    Account
                </StyledLinkText>
            </StyledLink>
        </StyledHeader>
    );
};
