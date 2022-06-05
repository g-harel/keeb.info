import {Layout} from "../../internal/layout";
import {isErr, newErr} from "../../internal/possible";
import {SearchIndex} from "../../internal/search_index";
import {convertViaToLayout} from "../../internal/via";
import {IngestContext, IngestedMetadata} from "./context";

// TODO index layout options and the like... maybe flatten that into a string?
const keyboardMetadataSearchableFields = ["name"];
export interface KeyboardMetadata {
    name: string;
    vendorID: string;
    productID: string;
    layout: Layout;
}

export const exportKeyboards = async (
    ctx: IngestContext,
): Promise<[string, Record<string, KeyboardMetadata>]> => {
    const keyboards: Record<string, KeyboardMetadata> = {};
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
            const name = ingested.via?.name || `${vendorID} ${productID}`;
            if (keyboards[name] !== undefined) {
                ctx.errors.nameConflicts.push({
                    error: newErr(name).describe("duplicate name").print(),
                    path: ingested.viaPath || "unknown",
                });
            }
            keyboards[name] = {
                name,
                vendorID,
                productID,
                layout: convertViaToLayout(ingested.via),
            };
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
        console.log(deserializedIndex.err.print());
        process.exit(1);
    }
    const result = deserializedIndex.search("wilba");
    if (isErr(result)) {
        console.log(result.err.print());
        process.exit(1);
    }

    return [serializedIndex, keyboards];
};
