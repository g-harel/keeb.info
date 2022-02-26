import moo from "moo";

import {readFile} from "../lib";

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

    return {
        vendorID: "",
    };
};
