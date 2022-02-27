import {IngestedMetadata, MetadataDB} from "./metadata";

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
