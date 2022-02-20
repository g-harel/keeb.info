import {readFile} from "../lib";

const parser = require("node-c-parser");

export interface QMKConfig {
    vendorID: string;
}

// TODO .h parser
export const parse = (filepath: string): QMKConfig => {
    const codeText = readFile(filepath);
    const tokens = parser.lexer.lexUnit.tokenize(codeText);
    const parse_tree = parser.parse(tokens);
    console.log("parse_tree", parse_tree, tokens, filepath);

    return {
        vendorID: "",
    };
};
