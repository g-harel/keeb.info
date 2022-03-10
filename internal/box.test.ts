import {Box, toComposite, toShape} from "./box";
import {Err} from "./possible";

describe("toComposite", () => {
    it("should combine touching boxes", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [1, 0]},
        ];
        const composite = toComposite(boxes);
        expect(composite).toHaveLength(1);
    });

    it("should support split boxes", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [0, 2]},
        ];
        const composite = toComposite(boxes);
        expect(composite).toHaveLength(2);
    });

    it("should combine complex touching boxes", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [0.5, 0.5]},
        ];
        const composite = toComposite(boxes);
        expect(composite[0]).toHaveLength(8);
    });
});

describe("toShape", () => {
    it("should combine touching boxes", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [1, 0]},
        ];
        const composite = toShape(boxes);
        expect(composite).toHaveLength(4);
    });

    it("should not support split boxes", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [0, 2]},
        ];
        const composite = toShape(boxes);
        expect(Err.isErr(composite)).toBeTruthy();
    });

    it("should combine complex touching boxes", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [0.5, 0.5]},
        ];
        const composite = toShape(boxes);
        expect(composite).toHaveLength(8);
    });
});
