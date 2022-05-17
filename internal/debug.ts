import {colorSeries} from "./color";
import {minmax} from "./point";
import {Composite, toSVGPath} from "./shape";

export const DEBUG_DISABLE_SVG_REF = false;

const defaultWidth = 400;
const testElementID = "test-element-component";

const document: any = (global as any).document;
let testElement: any;
const getTestElement = () => {
    testElement = document.getElementById(testElementID);
    if (!testElement) {
        testElement = document.createElement("div");
        testElement.setAttribute("id", testElementID);
        document.body.appendChild(testElement);
    }
    return testElement;
};

export const clear = () => {
    getTestElement().innerHTML = "";
};

// TODO 2022-05-16 move to website/
export const printDebugPath = (...composites: Composite[]) => {
    const [min, max] = minmax(composites.flat(2));
    const aspectRatio = (max[0] - min[0]) / (max[1] - min[1]);
    const colors = colorSeries("red", composites.length);

    getTestElement().innerHTML += `
        <svg
            viewBox="${min[0]} ${min[1]} ${max[0]} ${max[1]}"
            xmlns="http://www.w3.org/2000/svg"
            width="${defaultWidth}"
            height="${(defaultWidth / aspectRatio) * 1.2}"
            version="1.1"
        >
            ${composites
                .map((shape, i) => {
                    return shape.map(toSVGPath).map(
                        (p) => `
                            <path
                                fill="${colors[i]}"
                                opacity="50%"
                                d="${p}"
                            />`,
                    );
                })
                .flat(1)
                .join("")}
        </svg>`;
};
