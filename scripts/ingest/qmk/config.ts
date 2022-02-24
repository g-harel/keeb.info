import moo from "moo";

import {readFile} from "../lib";

const parser = require("node-c-parser");

export interface QMKConfig {
    vendorID: string;
}

const lexer = moo.states({
    default: {
        COMMENT: /#[^\n]*/,
        WHITESPACE: [
            {match: /[ \t]+/},
            {match: /\\/},
            {match: /\n/, lineBreaks: true},
        ],
        COMMENT_OPEN: {match: /\/\*/, push: "multiline_comment"},

        // Unsupported
        CONDITIONAL: {match: ["ifeq", "ifdef", "else", "endif"], error: true},
        EVAL: /\$\([^#\n]*/,

        ASSIGN: /[\:\+]?=/,
        SYMBOL: /[^\s=]+/,
    },
    multiline_comment: {
        COMMENT_CLOSE: {match: /\*\//, pop: 1},
        WHITESPACE: {match: /\n/, lineBreaks: true},
        COMMENT_CHAR: /./,
    },
});

// TODO .h parser
export const parse = (filepath: string): QMKConfig => {
    const codeText = readFile(filepath);
    const tokens = parser.lexer.lexUnit.tokenize(codeText);
    const parse_tree = parser.parse(tokens);
    // console.log("parse_tree", parse_tree, tokens, filepath);

    return {
        vendorID: "",
    };
};
