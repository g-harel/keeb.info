import {AsyncPossible, mightErr, newErr} from "../../internal/possible";
import {SearchIndex} from "../../internal/search_index";
import {KeyboardMetadata} from "../../scripts/ingest/export";

// TODO dedupe/cache requests
export const loadSearchData = async (): AsyncPossible<
    SearchIndex<KeyboardMetadata>
> => {
    let rawIndex = "";
    try {
        const rawIndex = mightErr(fetch("/keyboard-index.json"));
    } catch (e) {
        return newErr(String(e)).decorate("failed to fetch index");
    }
    try {
        return SearchIndex.fromSerialized(rawIndex);
    } catch (e) {
        console.log(e, rawIndex);
        return newErr(String(e)).decorate("corrupted index");
    }
};

// TODO this is not the right place
export const loadKeyboardMetadata = async (
    name: string,
): AsyncPossible<KeyboardMetadata> => {
    try {
        const keyboardIndexResponse = await fetch(`/keyboards/${name}.json`);
        return await keyboardIndexResponse.json();
    } catch (e) {
        return newErr(String(e)).decorate("failed to fetch keyboard");
    }
};
