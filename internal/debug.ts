import {minmax} from "./point";
import {Shape, toSVGPath} from "./shape";

const defaultWidth = 1200;

const document: any = (global as any).document;
let testElement: any; // TODO find if already created.

export const printDebugPath = (shapes: Shape[]) => {
    // TODO extract to private helper.
    if (!testElement) {
        testElement = document.createElement("div");
        document.body.appendChild(testElement);
    }

    const [min, max] = minmax(shapes.flat(1));
    const aspectRatio = (max[0] - min[0]) / (max[1] - min[1]);

    testElement.innerHTML += `
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
