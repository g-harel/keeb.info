import {serializedIndex} from "../../internal";
import {Layout} from "../../internal/layout";
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

const keyboardMetadataKey = "name";
const keyboardMetadataFields = [keyboardMetadataKey];
export interface KeyboardMetadata {
    name: string;
    vendorID: string;
    productID: string;
    layout: Layout;
}

export interface Metadata {
    keyboards: KeyboardMetadata[];
    index: any;
}

// TODO serialize keyboard metadata better
export const flatten = (ctx: IngestContext): Metadata => {
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

    const index = serializedIndex(
        keyboards,
        keyboardMetadataKey,
        keyboardMetadataFields,
    );
    log(`Index size: ${Math.round(index.length / 1000)}kB`);

    return {keyboards, index};
};
