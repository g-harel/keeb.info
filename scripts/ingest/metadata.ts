import {serializedIndex} from "../../internal";
import {Layout} from "../../internal/layout";
import {ViaDefinition, convertViaToLayout} from "../../internal/via";
import {IngestContext} from "./context";

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

    // TODO make consistent fields
    const index = serializedIndex(keyboards, "name", ["vendorID", "productID"]);

    return {keyboards, index};
};
