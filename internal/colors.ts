export const resolveColor = (hexOrCode: string): string => {
    switch (hexOrCode) {
        case "GR21": // Botanical white.
            return "#d3d7da";
        case "GN21": // Botanical light green.
            return "#9fb5ab";
        case "GN20": // Botanical dark green.
            return "#4a6056";
        case "botanical-beige":
            return "#c9c6bd";
    }
    return hexOrCode;
};
