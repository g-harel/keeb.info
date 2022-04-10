import {KeyboardMetadata} from "@ijprest/kle-serial";

import {Promible, newErr} from "../internal/possible";
import {SearchIndex} from "../internal/search_index";

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
        const data = JSON.parse(rawIndex);
        return SearchIndex.fromSerialized(data.index);
    } catch (e) {
        console.log(e, rawIndex);
        return newErr(String(e)).fwd("corrupted index");
    }
};
