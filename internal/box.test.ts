import {Box, toComposite} from "./box";

// TODO remove test case capitalization
describe("toComposite", () => {
    it("Should combine touching boxes.", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [1, 0]},
        ];
        const composite = toComposite(boxes);
        expect(composite).toHaveLength(1);
    });

    it("Should support split boxes.", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [0, 2]},
        ];
        const composite = toComposite(boxes);
        expect(composite).toHaveLength(2);
    });

    it("Should combine complex touching boxes.", () => {
        const boxes: Box[] = [
            {height: 1, width: 1, offset: [0, 0]},
            {height: 1, width: 1, offset: [0.5, 0.5]},
        ];
        const composite = toComposite(boxes);
        expect(composite[0]).toHaveLength(8);
    });
});
