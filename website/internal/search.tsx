import {AsyncPossible, isErr, mightErr, newErr} from "../../internal/possible";
import {SearchIndex} from "../../internal/search_index";
import {KeyboardMetadata} from "../../scripts/ingest/export";

let searchData: AsyncPossible<SearchIndex<KeyboardMetadata>> = null;
export const loadSearchDataInternal = async (): typeof searchData => {
    const rawIndexResponse = await mightErr(fetch("/keyboard-index.json"));
    if (isErr(rawIndexResponse)) {
        return rawIndexResponse.err.describe("fetch index");
    }

    const rawIndex = await mightErr(rawIndexResponse.text());
    if (isErr(rawIndex)) {
        return rawIndex.err.describe("read index data");
    }

    return SearchIndex.fromSerialized(rawIndex);
};
export const loadSearchData = async (): typeof searchData => {
    if (searchData === null) searchData = loadSearchDataInternal();
    return searchData;
};

// TODO this is not the right place
export const loadKeyboardMetadata = async (
    name: string,
): AsyncPossible<KeyboardMetadata> => {
    const keyboardIndexResponse = await mightErr(
        fetch(`/keyboards/${name}.json`),
    );
    if (isErr(keyboardIndexResponse)) {
        return keyboardIndexResponse.err.describe("fetch keyboard");
    }

    const keyboardIndex = await mightErr(keyboardIndexResponse.json());
    if (isErr(keyboardIndex)) {
        return keyboardIndex.err.describe("parse keyboard response");
    }

    return keyboardIndex;
};
