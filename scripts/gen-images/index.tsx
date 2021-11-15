import * as fs from "fs";

import * as glob from "glob";

import {renderKeyboard} from "./react";

const paths = glob.sync("files/kle/**/*.json");

let generatedContents = "";
for (const path of paths) {
    console.log(path);

    const file = fs.readFileSync(path).toString();
    const rendered = renderKeyboard(file);

    const svgPath = path
        .replace(/\.json$/g, ".svg")
        .replace("kle/", "kle/images/");
    fs.writeFileSync(svgPath, rendered.svg);

    const name = (/.*\/(\w+)\.svg$/g.exec(svgPath) || [null, "error"])[1];
    generatedContents += `<h2>${name}</h2><h4>${rendered.keyCount} keys</h4>\n`;
    generatedContents += `<img id="${name}" src="${svgPath}"/>\n`;
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
