const parser = require("node-c-parser");

export interface QMKConfig {
    vendorID: string;
}

// TODO .h parser
export const parse = (filepath: string): QMKConfig => {
    parser.lexer.cppUnit.clearPreprocessors(filepath, (err: Error, codeText: string) => {
        if (err) {
            return; // TODO
        }
        const tokens = parser.lexer.lexUnit.tokenize(codeText);
        const parse_tree = parser.parse(tokens);
        console.log(parse_tree);
    });

    return {
        vendorID: "",
    };
};
