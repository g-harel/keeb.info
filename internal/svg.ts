import {QuadSegment, RoundShape, Shape} from "./primitives";

export const straightPath = (shape: Shape): string => {
    let path = "";
    for (let i = 0; i < shape.length; i++) {
        const [start, end] = shape[i];
        path += `${i === 0 ? "M" : "L"} ${start} ${end} `;
    }
    path += "Z";
    return path;
};

export const roundedPath = (shape: RoundShape): string => {
    let path = "";
    for (let i = 0; i < shape.length; i++) {
        const [rStart, point, rEnd] = shape[i];
        path += `${i === 0 ? "M" : "L"} ${rStart[0]} ${rStart[1]} `;
        path += `Q ${point[0]} ${point[1]} ${rEnd[0]} ${rEnd[1]} `;
    }
    path += "Z";
    return path;
};
