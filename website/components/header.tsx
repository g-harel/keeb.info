import {isErr} from "possible-ts";
import React from "react";
import {Link} from "react-router-dom";
import styled from "styled-components";

import {getQuery, isPath} from "../internal/location";
import {theme} from "../internal/theme";
import {sitemap} from "../sitemap";
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
        color: ${theme.colors.main};
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

const StyledSearchForm = styled("form")`
    align-items: stretch;
    border-radius: 0.2em;
    border: 1.5px solid ${theme.colors.sub};
    display: flex;
    flex-direction: row;

    :focus-within {
        border-color: ${theme.colors.main};
    }
`;

const StyledSearchInput = styled("input")`
    border: none;
    border-radius: 0.3em;
    box-sizing: border-box;
    font-family: inherit;
    flex-grow: 1;
    padding: 0.5rem;
    z-index: 1;

    :focus {
        outline: none;
    }
`;

const StyledSearchSubmit = styled("button")`
    border: none;
    color: ${theme.colors.sub};
    cursor: pointer;
    background-color: transparent;
`;

export const Header = () => {
    const autofocus = isPath(sitemap.search.path);

    let query = getQuery();
    if (isErr(query)) {
        query = "";
    }

    return (
        <StyledHeader>
            <StyledLogoLink to="/">
                <Logo size="2rem" />
            </StyledLogoLink>
            <div style={{flexGrow: 1}}></div>
            <StyledSearchForm
                action="/search"
                method="GET"
                encType="application/x-www-form-urlencoded"
                autoComplete="off"
            >
                <StyledSearchInput
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="search"
                    autoFocus={autofocus}
                />
                <StyledSearchSubmit type="submit">
                    <SearchIcon />
                </StyledSearchSubmit>
            </StyledSearchForm>
            <StyledTextLink to={sitemap.demo.path}>/demo</StyledTextLink>
            <StyledTextLink to={sitemap.profile.path}>/profile</StyledTextLink>
            <StyledTextLink to={sitemap.search.path}>/search</StyledTextLink>
            <StyledTextLink to="/404">/404</StyledTextLink>
        </StyledHeader>
    );
};

const SearchIcon = () => (
    <svg
        width="0.7rem"
        aria-hidden="true"
        focusable="false"
        data-icon="search"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
    >
        <path
            fill="currentColor"
            d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
        ></path>
    </svg>
);
