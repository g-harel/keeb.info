import {Possible, newErr} from "possible-ts";

export const ERR_NOT_FOUND = newErr("not found");

export const getQuery = (): Possible<string> => {
    return (
        new URLSearchParams(window.location.search).get("q") || ERR_NOT_FOUND
    );
};

export const isPath = (path: string): boolean => {
    return window.location.pathname === path;
};
