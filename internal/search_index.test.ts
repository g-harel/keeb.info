import {isErr} from "./possible";
import {SearchIndex} from "./search_index";

const testStr = () => String(Math.random());

describe("SearchIndex", () => {
    it("should work", async () => {
        const testValue = testStr();
        const testDocument = {test: {[testStr()]: testValue}};

        const index = SearchIndex.fromDocuments(
            testDocument,
            Object.keys(testDocument.test),
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
