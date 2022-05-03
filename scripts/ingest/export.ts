import {Layout} from "../../internal/layout";
import {isErr} from "../../internal/possible";
import {SearchIndex} from "../../internal/search_index";
import {convertViaToLayout} from "../../internal/via";
import {IngestContext, IngestedMetadata} from "./context";

const keyboardMetadataSearchableFields = ["name"];
export interface KeyboardMetadata {
    name: string;
    vendorID: string;
    productID: string;
    layout: Layout;
}

export const exportKeyboards = async (
    ctx: IngestContext,
): Promise<[string, KeyboardMetadata[]]> => {
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
        keyboardMetadataSearchableFields,
    );
    const serializedIndex = await searchIndex.serialize();

    // Test that deserialziation works.
    // TODO this should be a test.
    const deserializedIndex = SearchIndex.fromSerialized(serializedIndex);
    if (isErr(deserializedIndex)) {
        console.log(deserializedIndex.print());
        process.exit(1);
    }
    const result = deserializedIndex.search("wilba");
    if (isErr(result)) {
        console.log(result.print());
        process.exit(1);
    }

    return [serializedIndex, keyboards];
};
