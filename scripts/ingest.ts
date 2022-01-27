import fs from "fs";
import glob from "glob";

import {ViaDefinition} from "../internal/via";

interface KeyboardMetadata {
    via?: ViaDefinition;
}

interface MetadataDB {
    [vendorID: number]: {
        [productID: number]: KeyboardMetadata;
    };
}

const db: MetadataDB = {};
const getEntry = (vendorID: number, productID: number): KeyboardMetadata => {
    if (!db[vendorID]) db[vendorID] = {};
    if (!db[vendorID][productID]) db[vendorID][productID] = {};
    return db[vendorID][productID];
};

const hexToInt = (hex: string): number | null => {
    let result = Number(hex);
    if (isNaN(result)) {
        result = Number("0x" + hex);
    }
    if (isNaN(result)) {
        return null;
    }
    return result;
};

const ingestVia = () => {
    glob.sync("external/the-via/keyboards/v3/**/*.json").forEach((path) => {
        const definition: ViaDefinition = JSON.parse(
            fs.readFileSync(path).toString("utf-8"),
        );
        const vendorID = hexToInt(definition.vendorId);
        const productID = hexToInt(definition.productId);
        if (vendorID === null || productID === null) {
            console.log(`Invalid product or vendor IDs: ${path}`);
            return;
        }
        getEntry(vendorID, productID).via = definition;
    });
};

ingestVia();
console.log(db);
