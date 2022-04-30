import {ViaDefinition} from "../../internal/via";

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

export interface IngestContext {
    errors: ErrorLog;
    metadata: MetadataDB;
    getMetadata: (vendorID: number, productID: number) => IngestedMetadata;
}

export interface ErrorLog {
    viaInvalidID: {
        path: string;
    }[];
    viaConflictingDefinitions: {
        path1: string;
        path2: string;
    }[];
    viaMissingLayout: {
        path: string;
    }[];
    qmkInvalidInfo: {
        path: string;
        error: string;
    }[];
    qmkInvalidConfig: {
        path: string;
        error: string;
    }[];
    qmkInvalidRules: {
        path: string;
        error: string;
    }[];
}

export const createContext = (): IngestContext => {
    const metadata: MetadataDB = {};
    return {
        metadata,
        getMetadata: (vendorID, productID): IngestedMetadata => {
            if (!metadata[vendorID]) metadata[vendorID] = {};
            if (!metadata[vendorID][productID])
                metadata[vendorID][productID] = {};
            return metadata[vendorID][productID];
        },
        errors: {
            viaInvalidID: [],
            viaConflictingDefinitions: [],
            viaMissingLayout: [],
            qmkInvalidInfo: [],
            qmkInvalidConfig: [],
            qmkInvalidRules: [],
        },
    };
};
