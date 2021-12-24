import {Pair, QuadPoint} from "../types/base";

export const straightPath = (points: Pair[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [start, end] = points[i];
        path += `${i === 0 ? "M" : "L"} ${start} ${end} `;
    }
    path += "Z";
    return path;
};

export const roundedPath = (points: QuadPoint[]): string => {
    let path = "";
    for (let i = 0; i < points.length; i++) {
        const [rStart, point, rEnd] = points[i];
        path += `${i === 0 ? "M" : "L"} ${rStart[0]} ${rStart[1]} `;
        path += `Q ${point[0]} ${point[1]} ${rEnd[0]} ${rEnd[1]} `;
    }
    path += "Z";
    return path;
};
