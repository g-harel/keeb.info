import {minmax} from "./point";
import {Shape, toSVGPath} from "./shape";

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

export const printDebugPath = (shapes: Shape[]) => {
    const [min, max] = minmax(shapes.flat(1));
    const aspectRatio = (max[0] - min[0]) / (max[1] - min[1]);

    getTestElement().innerHTML += `
        <svg 
            viewBox="${min[0]} ${min[1]} ${max[0]} ${max[1]}"
            xmlns="http://www.w3.org/2000/svg"
            width="${defaultWidth}"
            height="${defaultWidth / aspectRatio}"
            version="1.1"
        >
            ${shapes
                .map(toSVGPath)
                .map((p) => `<path fill="red" d="${p}" />`)
                .join("")}
        </svg>`;
};
