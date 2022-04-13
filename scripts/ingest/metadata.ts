import {Layout} from "../../internal/layout";
import {SearchIndex} from "../../internal/search_index";
import {ViaDefinition, convertViaToLayout} from "../../internal/via";
import {IngestContext} from "./context";
import {log} from "./lib";

export interface MetadataDB {
    // TODO these are not always numbers in QMK repo
    [vendorID: number]: {
        [productID: number]: IngestedMetadata;
    };
}
export interface IngestedMetadata {
    via?: ViaDefinition;
    viaPath?: string;
}

const keyboardMetadataFields = ["name"];
export interface KeyboardMetadata {
    name: string;
    vendorID: string;
    productID: string;
    layout: Layout;
}

// TODO serialize keyboard metadata more efficiently (repeated fields names, might not be required if gzip)
export const flattenToSerializedIndex = async (ctx: IngestContext): Promise<string> => {
    const keyboards: KeyboardMetadata[] = [];
    for (const [vendorID, products] of Object.entries(ctx.metadata)) {
        for (const [productID, ingested] of Object.entries<IngestedMetadata>(
            products,
        )) {
            if (!ingested.via) {
                ctx.errors.viaMissingLayout.push({
                    path: ingested.viaPath || "unknown",
                });
                continue;
            }
            keyboards.push({
                name: ingested.via?.name || `${vendorID} ${productID}`,
                vendorID,
                productID,
                layout: convertViaToLayout(ingested.via),
            });
        }
    }

    const searchIndex = SearchIndex.fromDocuments(
        keyboards,
        keyboardMetadataFields,
    );
    const serializedIndex = await searchIndex.serialize();
    log(`Index size: ${Math.round(serializedIndex.length / 1000)}kB`);

    // Test that deserialziation worrks.
    const deserializedIndex = SearchIndex.fromSerialized(serializedIndex);
    console.log(deserializedIndex.search("a")); // TODO fix with stringinfy at run time.

    return serializedIndex;
};
