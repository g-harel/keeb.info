import {Possible, newErr} from "./possible";

export const ERR_ILLEGAL_ARGUMENTS = newErr("invalid arguments");

// TODO 2022-06-27 document + test.
export const unorderedArrayComparator = <T>(
    comparator: (a: T, b: T) => boolean,
): ((a: T[], b: T[]) => boolean) => {
    return (a: T[], b: T[]): boolean => {
        if (a.length !== b.length) return false;
        if (a.length === 0) return true;
        for (let i = 0; i < b.length; i++) {
            let eq = true;
            for (let j = 0; j < b.length; j++) {
                if (!comparator(a[j], b[(i + j) % b.length])) {
                    eq = false;
                    break;
                }
            }
            if (eq) return true;
        }
        return false;
    };
};

// TODO 2022-06-21 document + test.
export const binarySearch = (
    min: number,
    max: number,
    jump: number,
    resolution: number,
    maxAttempts: number,
    tooSmall: (inc: number) => boolean,
): Possible<number> => {
    // Validate jump makes sense.
    if (min + jump > max) {
        return ERR_ILLEGAL_ARGUMENTS.describe(
            `jump exceeds search area (${jump} > ${max} - ${min})`,
        );
    }

    if (max !== Infinity && tooSmall(max)) {
        return newErr("max exceeded");
    }

    // Use jump repeatedly to find initial window.
    let start = min;
    let end = min + jump;
    while (tooSmall(end)) {
        if (end > max) return newErr("max exceeded");
        start = end;
        end += jump;
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
