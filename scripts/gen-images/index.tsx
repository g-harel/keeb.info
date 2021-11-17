import * as fs from "fs";
import * as glob from "glob";
import React from "react";
import ReactDOMServer from "react-dom/server";

import {LayoutKeymap} from "../../editor/components/views/layout-keymap";
import {convertKLEToLayoutKeymap} from "../../internal/convert";
import {Layout} from "../../internal/types/base";

const paths = glob.sync("files/kle/**/*.json");

let generatedContents = "";
for (const path of paths) {
    console.log(path);

    const file = fs.readFileSync(path).toString();
    const [layout, keymap] = convertKLEToLayoutKeymap(JSON.parse(file));
    const svg = ReactDOMServer.renderToStaticMarkup(
        <LayoutKeymap layout={layout as Layout} keymap={keymap} width={838} />,
    );

    const svgPath = path
        .replace(/\.json$/g, ".svg")
        .replace("kle/", "kle/images/");
    fs.writeFileSync(svgPath, svg);

    const name = (/.*\/(\w+)\.svg$/g.exec(svgPath) || [null, "error"])[1];
    generatedContents += `<h2>${name}</h2><h4>${layout.fixedKeys.length} keys</h4>\n`;
    generatedContents += `<img id="${name}" src="${svgPath}" style="min-height:200px;" />\n`;
}

const outContents = `<html>
    <head>
        <title>Keyboard Layouts</title>
        <style>
            * {font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;}
            htsml {background-color: #a1a189;}
            h2, h4 {margin: 0;}
            img {margin: 10px 0 70px;}
        </style>
    </head>
    <body style="padding:100px;">
        <div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;align-items:center;">
            ${generatedContents}
            <a href="https://github.com/g-harel/keeb.info" style="padding:40px;">
                github.com/g-harel/keeb.info
            </a>
        </div>
    </body>
</html>
`;
fs.writeFileSync("index.html", outContents);
