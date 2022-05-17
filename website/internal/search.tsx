import {Layout} from "../../internal/layout";
import {Promible, newErr} from "../../internal/possible";
import {SearchIndex} from "../../internal/search_index";
import {KeyboardMetadata} from "../../scripts/ingest/export";

// TODO dedupe/cache requests
export const loadSearchData = async (): Promible<
    SearchIndex<KeyboardMetadata>
> => {
    let rawIndex = "";
    try {
        const keyboardIndexResponse = await fetch("/keyboard-index.json");
        rawIndex = await keyboardIndexResponse.text();
    } catch (e) {
        return newErr(String(e)).fwd("failed to fetch index");
    }
    try {
        return SearchIndex.fromSerialized(rawIndex);
    } catch (e) {
        console.log(e, rawIndex);
        return newErr(String(e)).fwd("corrupted index");
    }
};

// TODO this is not the right place
export const loadKeyboardMetadata = async (
    name: string,
): Promible<KeyboardMetadata> => {
    try {
        const keyboardIndexResponse = await fetch(`/keyboards/${name}.json`);
        return await keyboardIndexResponse.json();
    } catch (e) {
        return newErr(String(e)).fwd("failed to fetch keyboard");
    }
};
