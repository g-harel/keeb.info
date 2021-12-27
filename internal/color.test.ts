import {colorSeries} from "./color";

describe("colorSeries", () => {
    it("Should use the start color as the first color.", () => {
        const startColor = "#FFFFFF";
        const colors = colorSeries(startColor, 5);
        expect(colors[0]).toBe(startColor);
    });

    it("Should produce the desired number of colors.", () => {
        const colors = colorSeries("#FF0000", 3);
        expect(colors.length).toBe(3);
    });

    it("Should produce only unique colors.", () => {
        const colors = colorSeries("#0000FF", 100);
        const seen: Record<string, boolean> = {};
        for (const color of colors) {
            expect(seen[color]).toBeFalsy();
            seen[color] = true;
        }
    });

    it("Should produce only correctly formatted colors", () => {
        const colors = colorSeries("#00FF00", 100);
        for (const color of colors) {
            expect(color).toMatch(/^#[0-9A-F]{6}$/);
        }
    });
});
