import React from "react";
import {useNavigate} from "react-router-dom";
import styled from "styled-components";

import {Login, logout, useAuthState} from "../internal/firebase";
import {sitemap} from "../sitemap";

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2rem;
`;

export const Profile = () => {
    const [user, loading, error] = useAuthState();
    const navigate = useNavigate();

    if (error) {
        console.error(error);
        navigate(sitemap.home.path);
    }

    if (loading) {
        return null;
    }

    return (
        <StyledWrapper>
            {user ? (
                <>
                    <button onClick={logout}>logout</button>
                </>
            ) : (
                <>
                    <Login />
                </>
            )}
        </StyledWrapper>
    );
};
