import React from "react";
import ReactDOMServer from "react-dom/server";

import {LayoutKeymap} from "../../editor/components/views/layout-keymap";
import {convertKLEToLayoutKeymap} from "../../internal/convert";
import {Layout} from "../../internal/types/base";

export interface RenderedKeyboard {
    keyCount: number;
    svg: string;
}

// TODO move to ./index.tsx
export const renderKeyboard = (serializedKeyboard: any): RenderedKeyboard => {
    const [layout, keymap] = convertKLEToLayoutKeymap(
        JSON.parse(serializedKeyboard),
    );
    return {
        keyCount: layout.fixedKeys.length,
        svg: ReactDOMServer.renderToStaticMarkup(
            <LayoutKeymap
                layout={layout as Layout}
                keymap={keymap}
                width={838}
            />,
        ),
    };
};
