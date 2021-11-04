export const resolveColor = (hexOrCode: string): string => {
    switch (hexOrCode) {
        case "GR21": // Botanical white.
            return "#ebeded";
        case "GN21": // Botanical light green.
            return "#9fb5ab";
        case "GN20": // Botanical dark green.
            return "#4a6056";
        case "botanical-beige":
            return "#e6e2da";
    }
    return hexOrCode;
};
