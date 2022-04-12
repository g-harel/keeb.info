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

export interface Metadata {
    // TODO keyboard info is redundant with index
    keyboards: KeyboardMetadata[];
    index: any;
}

// TODO serialize keyboard metadata more efficiently (repeated fields names, might not be required if gzip)
export const flatten = async (ctx: IngestContext): Promise<Metadata> => {
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

    // TODO double serialized adds a lot of useless escape chars
    return {
        // TODO might not need if stored in index.
        keyboards: [],
        index: serializedIndex,
    };
};
