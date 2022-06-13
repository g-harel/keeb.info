import {isErr} from "./possible";
import {SearchIndex} from "./search_index";

const testStr = () => String(Math.random());

describe("SearchIndex", () => {
    it("should work", async () => {
        const testValue = testStr();

        const index = SearchIndex.fromDocuments({t: {}}, () => [testValue]);
        const indexCopy = SearchIndex.fromSerialized(await index.serialize());
        if (isErr(indexCopy))
            throw indexCopy.err.describe("deserialize").print();

        const matchingResult = index.search(testValue);
        if (isErr(matchingResult))
            throw matchingResult.err.describe("match").print();
        expect(matchingResult).toHaveLength(1);

        const matchingCopyResult = indexCopy.search(testValue);
        if (isErr(matchingCopyResult))
            throw matchingCopyResult.err.describe("match copy").print();
        expect(matchingCopyResult).toHaveLength(1);

        const nonMatchingResult = indexCopy.search(testStr());
        if (isErr(nonMatchingResult))
            throw nonMatchingResult.err.describe("not match").print();
        expect(nonMatchingResult).toHaveLength(0);
    });
});
