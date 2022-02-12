export interface QMKConfig {
    vendorID: string;
}

// TODO .h parser
export const parse = (raw: string): QMKConfig => {
    return {
        vendorID: "",
    };
};
