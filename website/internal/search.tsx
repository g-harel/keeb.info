import {AsyncPossible, isErr, mightErr, newErr} from "../../internal/possible";
import {SearchIndex} from "../../internal/search_index";
import {KeyboardMetadata} from "../../scripts/ingest/export";

// TODO dedupe/cache requests
export const loadSearchData = async (): AsyncPossible<
    SearchIndex<KeyboardMetadata>
> => {
    let rawIndex = "";
    try {
        // TODO 2022-06-01 make this work after refactor.
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
    const keyboardIndexResponse = await mightErr(fetch(`/keyboards/${name}.json`));
    if (isErr(keyboardIndexResponse)) {
        return keyboardIndexResponse.err.decorate("fetch keyboard");
    }

    const keyboardIndex = await mightErr(keyboardIndexResponse.json());
    if (isErr(keyboardIndex)) {
        return keyboardIndex.err.decorate("parse keyboard response");
    }

    return keyboardIndex;
};
