import {Shape, equalShape} from "./shape";

describe("equalShape", () => {
    it("return true when empty", () => {
        const a: Shape = [];
        const b: Shape = [];
        expect(equalShape(a, b)).toBeTruthy();
    });

    it("should detect unequal shapes", () => {
        const a: Shape = [
            [0, 1],
            [1, 1],
        ];
        const b: Shape = [
            [0, 1],
            [2, 1],
        ];
        expect(equalShape(a, b)).toBeFalsy();
    });

    it("should detect equal shapes", () => {
        const a: Shape = [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
        ];
        const b: Shape = [
            [1, 1],
            [1, 0],
            [0, 0],
            [0, 1],
        ];
        expect(equalShape(a, b)).toBeTruthy();
    });

    it("should detect reversed shapes", () => {
        // TODO order is guaranteed by "polygon-clipping" so don't really need.
    });
});
