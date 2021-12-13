import React from "react";
import {RouteObject} from "react-router-dom";

import {Layouts} from "./pages/layouts";
import {Account} from "./pages/account";
import {Demo} from "./pages/demo";

export const sitemap = {
    home: {
        path: "/",
        element: <Layouts />,
    },
    account: {
        path: "/account",
        element: <Account />,
    },
    demo: {
        path: "/demo",
        element: <Demo />,
    },
    // TODO 404
};

// Type assertion.
const _: Record<string, RouteObject> = sitemap;
