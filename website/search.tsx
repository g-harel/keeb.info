import lunr from "lunr";

import {Promible, isErr, newErr} from "../internal/possible";
import {deserializeIndex} from "../internal/search";

export const loadSearchData = async (): Promible<lunr.Index> => {
    let rawIndex = "";
    try {
        const keyboardIndexResponse = await fetch("/keyboard-index.json");
        rawIndex = await keyboardIndexResponse.text();
    } catch (e) {
        return newErr(String(e)).fwd("failed to fetch index");
    }
    try {
        const data = JSON.parse(rawIndex);
        return deserializeIndex(data.index);
    } catch (e) {
        console.log(e);
        return newErr(String(e)).fwd("corrupted index");
    }
};

(async () => {
    const idx = await loadSearchData();
    if (isErr(idx)) {
        console.warn(idx.err.print());
        return;
    }

    console.log(idx.search("a")); // TODO
})();
