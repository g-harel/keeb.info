import React from "react";

import {Login, logout, useAuthState} from "./firebase";

export const Header = () => {
    const [user, loading, error] = useAuthState();

    if (loading) {
        return <>loading</>;
    }

    if (error) {
        return <>{error}</>;
    }

    return (
        <div>
            {user ? (
                <>
                    <button onClick={logout}>logout</button>
                </>
            ) : (
                <>
                    <h1>My App</h1>
                    <p>Please sign-in:</p>
                    <Login />
                </>
            )}
        </div>
    );
};
