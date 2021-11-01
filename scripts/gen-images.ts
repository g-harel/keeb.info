import * as fs from "fs";

import {Serial} from "@ijprest/kle-serial";
import * as glob from "glob";

import {renderSvg} from "../internal/kle-renderer/svg";

const paths = glob.sync("files/kle/**/*.json");

const svgPaths: string[] = [];
for (const path of paths) {
    console.log(path);
    const rendered = renderSvg(Serial.parse(fs.readFileSync(path).toString()));
    const svgPath = path
        .replace(/\.json$/g, ".svg")
        .replace("kle/", "kle/images/");
    fs.writeFileSync(svgPath, rendered);
    svgPaths.push(svgPath);
}

let images = "";
for (const svgPath of svgPaths) {
    const name = (/.*\/(\w+)\.svg$/g.exec(svgPath) || [null, "error"])[1];
    images += `<img id="${name}" src="${svgPath}"/>\n`;
}
const outContents = `<html>
    <head>
        <title>Keyboard Layouts</title>
    </head>
    <body style="padding:100px;">
        <div style="max-width:1000px;margin:0 auto;display:flex;flex-direction:column;align-items:center;">
${images}            <a href="https://github.com/g-harel/kbd" style="padding:40px;">
                github.com/g-harel/kbd
            </a>
        </div>
    </body>
</html>
`;
fs.writeFileSync("index.html", outContents);
