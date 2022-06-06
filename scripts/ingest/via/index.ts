import fastGlob from "fast-glob";
import fs from "fs";

import {ViaDefinition} from "../../../internal/via";
import {IngestContext} from "../context";
import {hexToInt} from "../lib";

export const ingestVia = (ctx: IngestContext) => {
    fastGlob
        .sync("external/the-via/keyboards/v3/**/*.json")
        .forEach((definitionPath) => {
            const definition: ViaDefinition = JSON.parse(
                fs.readFileSync(definitionPath).toString("utf-8"),
            );
            const vendorID = hexToInt(definition.vendorId);
            const productID = hexToInt(definition.productId);
            if (vendorID === null || productID === null) {
                ctx.errors.viaInvalidID.push({path: definitionPath});
                return;
            }
            const entry = ctx.getMetadata(vendorID, productID);
            if (entry.viaPath) {
                ctx.errors.viaConflictingDefinitions.push({
                    path1: entry.viaPath,
                    path2: definitionPath,
                });
                return;
            }
            entry.via = definition;
            entry.viaPath = definitionPath;
        });
};
