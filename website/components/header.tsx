import color from "color";
import React from "react";
import {Link} from "react-router-dom";
import styled from "styled-components";
import {sitemap} from "../sitemap";

import {theme} from "../theme";
import {Logo} from "./logo";

const StyledHeader = styled.header`
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    height: 3rem;
    justify-content: space-between;
    padding: 0 0.3rem;
`;

const StyledLogoLink = styled(Link)`
    border-radius: 0.2rem;
    color: ${theme.colors.sub};
    padding: 0.2rem;
    text-decoration: none;

    :hover {
        color: ${theme.colors.main}
    }

    :active {
        opacity: 0.8;
    }
`;

const StyledTextLink = styled(Link)`
    color: ${theme.colors.text};
    font-size: 0.8rem;
    margin-right: 1rem;
    padding: 0.5rem;

    :not(:hover) {
        text-decoration: none;
    }
`;

export const Header = () => {
    return (
        <StyledHeader>
            <StyledLogoLink to="/">
                <Logo size="2rem" />
            </StyledLogoLink>
            <div style={{flexGrow: 1}}></div>
            <StyledTextLink to={sitemap.demo.path}>/demo</StyledTextLink>
            <StyledTextLink to={sitemap.profile.path}>/profile</StyledTextLink>
            <StyledTextLink to="/404">/404</StyledTextLink>
        </StyledHeader>
    );
};
