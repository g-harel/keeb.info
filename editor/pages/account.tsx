import React from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";

import {Login, logout, useAuthState} from "../firebase";

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Account = () => {
    const [user, loading, error] = useAuthState();
    const navigate = useNavigate();

    if (error) {
        console.error(error);
        navigate("/"); // TODO variable.
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
