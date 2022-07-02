import {rotatedArrayCompare} from "./algorithms";

const eq = (a: number, b: number) => a === b;

describe("rotatedArrayCompare", () => {
    it("should return true for empty arrays", () => {
        const a: number[] = [];
        const b: number[] = [];

        expect(rotatedArrayCompare(eq)(a, b)).toBeTruthy();
    });

    it("should return false for unequal length arrays", () => {
        const a: number[] = [1];
        const b: number[] = [2, 3];

        expect(rotatedArrayCompare(eq)(a, b)).toBeFalsy();
    });

    it("should return true for exactly equal", () => {
        const a: number[] = [8, 2, 3, 5];
        const b: number[] = a.slice();

        expect(rotatedArrayCompare(eq)(a, b)).toBeTruthy();
    });

    it("should return true for rotated arrays", () => {
        const a: number[] = Array.from({length: 32}, Math.random);
        const n: number = 1 + Math.floor(Math.random() * (a.length - 1));
        const b: number[] = a.slice(n, a.length).concat(a.slice(0, n));

        expect(rotatedArrayCompare(eq)(a, b)).toBeTruthy();
    });
});