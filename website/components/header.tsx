import color from "color";
import React from "react";
import {Link} from "react-router-dom";
import styled from "styled-components";

import {ReactProps} from "../../internal/react";
import {theme, useTheme} from "../theme";
import {Logo} from "./logo";

const StyledHeader = styled.header`
    align-items: center;
    background-color: ${theme.colors.highlight};
    border-bottom: 2px solid ${theme.colors.highlightAccent};
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
        background-color: ${theme.colors.highlightAccent};
    }

    :active {
        opacity: 0.8;
    }
`;

const StyledTextLink = styled(Link)`
    background-color: ${color("#a7e7f0").hex()};
    border-radius: 0.25rem;
    border: 1px solid ${color("#a7e7f0").darken(0.1).hex()};
    color: ${color("#a7e7f0").darken(0.5).hex()};
    font-size: 0.8rem;
    font-weight: bold;
    justify-self: flex-end;
    margin-left: 1rem;
    padding: 0.5rem;
    text-decoration: none;
    text-transform: uppercase;
`;

export const Header = (props: ReactProps) => {
    const theme = useTheme();
    return (
        <StyledHeader>
            <StyledLogoLink to="/">
                <Logo color={theme.colors.secondary} size="2rem" />
            </StyledLogoLink>
            <div style={{flexGrow: 1}}></div>
            <StyledTextLink to="/demo">Demo</StyledTextLink>
            <StyledTextLink to="/account">Profile</StyledTextLink>
        </StyledHeader>
    );
};
