import React from "react";
import {RouteObject} from "react-router-dom";

import {Demo} from "./pages/demo";
import {Layouts} from "./pages/layouts";
import {Message} from "./pages/message";
import {Profile} from "./pages/profile";
import {Search} from "./pages/search";

export const sitemap = {
    home: {
        path: "/",
        element: <Layouts />,
    },
    profile: {
        path: "/profile",
        element: <Profile />,
    },
    demo: {
        path: "/demo",
        element: <Demo />,
    },
    search: {
        path: "/search",
        element: <Search />,
    },
    missing: {
        path: "*",
        element: <Message banner="404" message="Not Found" />,
    },
};

// Type assertion.
const _: Record<string, RouteObject> = sitemap;
