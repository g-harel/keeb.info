import React from "react";
import ReactDOMServer from "react-dom/server";

import {ExplodedLayout} from "../../editor/components/views/exploded-layout";
import {convertKLEToLayout} from "../../internal/convert";
import {Layout} from "../../internal/types/base";

export const renderKeyboard = (serializedKeyboard: any): string => {
    const demoLayout = convertKLEToLayout(serializedKeyboard);
    return ReactDOMServer.renderToStaticMarkup(
        <ExplodedLayout layout={demoLayout as Layout} width={1200} />,
    );
};
