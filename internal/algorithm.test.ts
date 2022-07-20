import {isErr} from "possible-ts";

import {binarySearch, rotatedArrayCompare} from "./algorithms";

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

describe("binarySearch", () => {
    const runSearch = (target: number, inputs: {
        min?: number;
        max?: number;
        resolution?: number;
        jump?: number;
        attempts?: number;
    } = {}) => {
        const defaults = {
            min: 0,
            max: 1,
            resolution: 0.001,
            jump: 0.1,
            attempts: 100,
        };
        const required: Required<typeof inputs> = Object.assign(
            defaults,
            inputs,
        );

        const mockTooSmall = jest.fn((v) => v < target);
        const result = binarySearch(
            required.min,
            required.max,
            required.jump,
            required.resolution,
            required.attempts,
            mockTooSmall,
        );

        if (!isErr(result)) {
            expect(result).toBeCloseTo(target, -Math.log10(required.resolution));
        }
        return {mock: mockTooSmall, result};
    };

    it("should find values", () => {
        for (let i = 0; i < 12; i++) {
            runSearch(Math.random());
        }
    });

    it("should not exceed max attempts with small jumps", () => {
        const jump = 10e-5;
        const attempts = 8;

        const {mock, result} = runSearch(1, {jump, attempts});

        expect(isErr(result)).toBeTruthy();
        expect(mock).toHaveBeenCalledTimes(attempts);
    });

    it("should not exceed max attempts with small resolution", () => {
        const resolution = 10e-100;
        const attempts = 4;

        const {mock, result} = runSearch(1, {resolution, attempts});

        expect(isErr(result)).toBeTruthy();
        expect(mock).toHaveBeenCalledTimes(attempts);
    });

    it("should support infinite max range", () => {
        const max = Infinity;

        const {result} = runSearch(Math.random(), {max});

        expect(isErr(result)).toBeFalsy();
    });
});
