import lunr from "lunr";

import {Prossible, isErr, newErr} from "../internal/possible";
import {deserializeIndex} from "../internal/search";

export const useStorageAsset = async (): Prossible<lunr.Index> => {
    let rawIndex = "";
    try {
        const keyboardIndexResponse = await fetch("/keyboard-index.json");
        rawIndex = await keyboardIndexResponse.text();
    } catch (e) {
        return newErr(String(e)).fwd("failed to fetch index");
    }
    try {
        return deserializeIndex(rawIndex);
    } catch (e) {
        return newErr(String(e)).fwd("corrupted index");
    }
};

(async () => {
    const idx = await useStorageAsset();
    if (isErr(idx)) {
        console.warn(idx.err.print());
        return;
    }

    console.log(idx.search("trio"));
})();
