import {Layout, SpreadResult, spreadSectionsOffsets} from "../../internal/layout";
import {isErr, newErr} from "../../internal/possible";
import {SearchIndex} from "../../internal/search_index";
import {convertViaToLayout} from "../../internal/via";
import {IngestContext, IngestedMetadata} from "./context";

export interface KeyboardMetadata {
    name: string;
    vendorID: string;
    productID: string;
    layout: Layout;
    spreadResult: SpreadResult;
}

// TODO index layout options and the like... maybe flatten that into a string?
const keyboardMetadataFieldExtractor = (
    keyboard: KeyboardMetadata,
): string[] => {
    const values: string[] = [
        keyboard.name,
        keyboard.productID,
        keyboard.vendorID,
        keyboard.layout.label,
    ];
    keyboard.layout.variableSections.forEach((section) => {
        values.push(section.label);
        section.options.forEach((option) => {
            values.push(option.label);
        });
    });
    return values;
};

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
            const layout = convertViaToLayout(ingested.via);
            keyboards[name] = {
                name,
                vendorID,
                productID,
                layout,
                spreadResult: spreadSectionsOffsets(layout)
            };
        }
    }

    const searchIndex = SearchIndex.fromDocuments(
        keyboards,
        keyboardMetadataFieldExtractor,
    );
    const serializedIndex = await searchIndex.serialize();

    // Test that deserialziation works.
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
    if (result.length === 0) {
        console.log("index failed");
        process.exit(1);
    }

    return [serializedIndex, keyboards];
};
