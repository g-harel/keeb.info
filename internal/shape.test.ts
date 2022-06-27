import {Composite, Shape, equalComposite, equalShape} from "./shape";

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

describe("equalComposite", () => {
    it("return true when empty", () => {
        const a: Composite = [];
        const b: Composite = [];
        expect(equalComposite(a, b)).toBeTruthy();
    });

    it("should detect unequal composites", () => {
        const a: Composite = [
            [
                [0, 1],
                [1, 1],
            ],
        ];
        const b: Composite = [
            [
                [0, 1],
                [2, 1],
            ],
        ];
        expect(equalComposite(a, b)).toBeFalsy();
    });

    it("should detect equal composites", () => {
        const a: Composite = [
            [
                [3, 4],
                [1, 2],
            ],
            [],
            [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
            ],
        ];
        const b: Composite = [
            [
                [1, 1],
                [1, 0],
                [0, 0],
                [0, 1],
            ],
            [
                [3, 4],
                [1, 2],
            ],
            [],
        ];
        expect(equalComposite(a, b)).toBeTruthy();
    });

    it("should detect reversed composites", () => {
        // TODO order is guaranteed by "polygon-clipping" so don't really need.
    });
});
