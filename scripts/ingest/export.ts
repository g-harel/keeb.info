import {Layout} from "../../internal/layout";
import {isErr, newErr} from "../../internal/possible";
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
    const seenNames: Record<string, number> = {};
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
            if (seenNames[name] !== undefined) {
                seenNames[name] += 1;
                // TODO report error here and include path(s).
                continue;
            } else {
                seenNames[name] = 1;
            }
            keyboards.push({
                name,
                vendorID,
                productID,
                layout: convertViaToLayout(ingested.via),
            });
        }
    }

    // Report repeated keyboard names.
    const repeated = Object.entries(seenNames).filter(([, count]) => count > 1);
    ctx.errors.nameConflicts.push(
        ...repeated.map(([name, count]) => {
            return {
                error: newErr(`x${count} ${name}`)
                    .fwd("duplicate names")
                    .print(),
            };
        }),
    );

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
