import React from "react";
import {RouteObject} from "react-router-dom";

import {Profile} from "./pages/profile";
import {Demo} from "./pages/demo";
import {Layouts} from "./pages/layouts";
import {Message} from "./pages/message";

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
    missing: {
        path: "*",
        element: <Message banner="404" message="Not Found" />,
    },
};

// Type assertion.
const _: Record<string, RouteObject> = sitemap;
