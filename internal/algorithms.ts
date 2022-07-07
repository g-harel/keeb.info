import {Possible, newErr} from "possible-ts";

export const ERR_ILLEGAL_ARGUMENTS = newErr("invalid arguments");

// Test whether two arrays are equal ignoring the order.
// Returns true if equal.
export const rotatedArrayCompare = <T>(
    compare: (a: T, b: T) => boolean,
): ((a: T[], b: T[]) => boolean) => {
    return (a: T[], b: T[]): boolean => {
        if (a.length !== b.length) return false;
        if (a.length === 0) return true;
        for (let i = 0; i < b.length; i++) {
            let eq = true;
            for (let j = 0; j < b.length; j++) {
                if (!compare(a[j], b[(i + j) % b.length])) {
                    eq = false;
                    break;
                }
            }
            if (eq) return true;
        }
        return false;
    };
};

// TODO 2022-06-21 test.
// Binary search between "min" and "max" for a value that is within "resolution"
// of being "tooSmall". The "jump" is used iteratively to find a search window
// when it is smaller than "max - min" (ex. max is Infinity).
export const binarySearch = (
    min: number,
    max: number,
    jump: number,
    resolution: number,
    maxAttempts: number,
    tooSmall: (inc: number) => boolean,
): Possible<number> => {
    // Validate jump value.
    if (jump <= 0) {
        return ERR_ILLEGAL_ARGUMENTS.describe(
            `jump is not a positive number: ${jump}`,
        );
    }
    if (min + jump > max) {
        return ERR_ILLEGAL_ARGUMENTS.describe(
            `jump exceeds search area (${jump} > ${max} - ${min})`,
        );
    }

    // Use jump repeatedly to find initial window.
    let start = min;
    let end = min + jump;
    while (tooSmall(end) && maxAttempts > 0) {
        // Attempt is still too small at max, search failed.
        if (end === max) return newErr("max exceeded");
        maxAttempts--;
        start = end;
        end += jump;
        if (end > max) end = max;
    }

    // Use binary search to find first increment within resolution.
    let prevAttempt = 0;
    for (let i = 0; i < maxAttempts; i++) {
        // Calculate new attempt and return if within resolution.
        const attempt = start + (end - start) / 2;
        if (Math.abs(prevAttempt - attempt) < resolution) return prevAttempt;
        prevAttempt = attempt;

        const attemptTooSmall = tooSmall(attempt);
        if (attemptTooSmall) {
            start = attempt;
        } else {
            end = attempt;
        }
    }

    return newErr("binary search failed, too many attempts");
};
