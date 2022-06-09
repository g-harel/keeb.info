import {isErr} from "./possible";
import {SearchIndex} from "./search_index";

const testStr = () => String(Math.random());

describe("SearchIndex", () => {
    it("should work", async () => {
        const testKey = testStr();
        const testValue = testStr();
        const testDocument = {test: {[testKey]: testValue}};

        const index = SearchIndex.fromDocuments(
            testDocument,
            (doc: any) => [doc[testKey]],
        );
        const indexCopy = SearchIndex.fromSerialized(await index.serialize());
        if (isErr(indexCopy))
            throw indexCopy.err.describe("deserialize").print();

        const matchingResult = indexCopy.search(testValue);
        if (isErr(matchingResult))
            throw matchingResult.err.describe("match").print();
        expect(matchingResult).toHaveLength(1);

        const nonMatchingResult = indexCopy.search(testStr());
        if (isErr(nonMatchingResult))
            throw nonMatchingResult.err.describe("not match").print();
        expect(nonMatchingResult).toHaveLength(0);
    });
});
