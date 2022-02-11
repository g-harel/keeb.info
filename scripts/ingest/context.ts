import {ViaDefinition} from "../../internal/via";

export interface IngestContext {
    errors: ErrorLog;
    metadata: MetadataDB;
    getMetadata: (vendorID: number, productID: number) => KeyboardMetadata;
}

export interface KeyboardMetadata {
    via?: ViaDefinition;
    viaPath?: string;
}

export interface MetadataDB {
    // TODO these are not always numbers in QMK
    [vendorID: number]: {
        [productID: number]: KeyboardMetadata;
    };
}

export interface QMKInfo {
    layouts: any[];
}

export interface QMKConfig {
    vendorID: string;
}

export interface QMKRules {
    MCU: string;
}

export interface ErrorLog {
    viaInvalidID: {
        path: string;
    }[];
    viaConflictingDefinitions: {
        path1: string;
        path2: string;
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
        getMetadata: (vendorID, productID): KeyboardMetadata => {
            if (!metadata[vendorID]) metadata[vendorID] = {};
            if (!metadata[vendorID][productID])
                metadata[vendorID][productID] = {};
            return metadata[vendorID][productID];
        },
        errors: {
            viaInvalidID: [],
            viaConflictingDefinitions: [],
            qmkInvalidInfo: [],
            qmkInvalidConfig: [],
            qmkInvalidRules: [],
        },
    };
};
