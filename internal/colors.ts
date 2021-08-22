export const resolveColor = (hexOrCode: string): string => {
    switch (hexOrCode) {
        case "WS1":
            return "#d3d7da";
        case "botanical-light-green":
            return "#9fb5ab";
        case "botanical-dark-green":
            return "#4a6056";
    }
    return hexOrCode;
};
