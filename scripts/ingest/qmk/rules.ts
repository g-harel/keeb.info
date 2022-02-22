import moo from "moo";

import {
    InputToken,
    OutputToken,
    tokenize,
} from "../../../internal/parsing/tokenizer";
import {Err, Possible} from "../../../internal/possible";

export interface QMKRules {
    layouts: string[];
    viaEnable: boolean;
    defaultFolder?: string;
    raw: Record<string, string[]>;
}

enum Type {
    EVAL, // 0
    INCLUDE, // 1
    WHITESPACE, // 2
    COMMENT, // 3
    ASSIGN, // 4
    SYMBOL, // 5
    CONDITIONAL, // 6
}

// TODO use multiline for config files...
// TODO support symbols that contain eq "-test=true"
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

const rulesTokens: InputToken<Type>[] = [
    {type: Type.COMMENT, pattern: "#[^\\n]*\\n?"},
    {type: Type.WHITESPACE, pattern: "\\s+"},
    {type: Type.WHITESPACE, pattern: "\\\\"},

    // Unsupported.
    {type: Type.CONDITIONAL, pattern: "ifeq"},
    {type: Type.CONDITIONAL, pattern: "idef"},
    {type: Type.CONDITIONAL, pattern: "else"},
    {type: Type.CONDITIONAL, pattern: "endif"},
    {type: Type.EVAL, pattern: "\\$\\([^#\\n]*"},
    {type: Type.INCLUDE, pattern: "include"}, // TODO not being found for rgbkb/sol

    // Semantic.
    {type: Type.ASSIGN, pattern: "[\\:\\+]?="},
    {type: Type.SYMBOL, pattern: "[^\\s=]+"},
];

const extract = (
    tokens: OutputToken<Type>[],
): Possible<Record<string, string[]>> => {
    const values: Record<string, string[]> = {};

    const semanticTokens = tokens.filter((token) => {
        return token.type !== Type.COMMENT && token.type !== Type.WHITESPACE;
    });

    // Fail when token is unsupported.
    for (const token of semanticTokens) {
        if (
            token.type === Type.CONDITIONAL ||
            token.type === Type.EVAL ||
            token.type === Type.INCLUDE
        ) {
            return Err.err(JSON.stringify(token)).with("unsupported token");
        }
    }

    // State.
    let lastSymbol: OutputToken<Type> | null = null;
    let assignSymbol: string | null = null;
    let lastToken: OutputToken<Type> | null = null;

    for (let i = 0; i < semanticTokens.length; i++) {
        const token = semanticTokens[i];

        if (token.type === Type.SYMBOL) {
            // Ignore when burning.
            if (assignSymbol === null) {
                // Two symbols following each other with no assignment.
                if (lastToken !== null && lastToken.type === Type.SYMBOL) {
                    return Err.err(JSON.stringify(lastToken)).with(
                        "loose symbol",
                    );
                }
            } else {
                // Assign when demanded.
                if (values[assignSymbol] === undefined) {
                    values[assignSymbol] = [];
                }
                values[assignSymbol].push(token.value[0]);
            }
            lastSymbol = token;
            assignSymbol = assignSymbol;
            lastToken = token;
            continue;
        }

        if (token.type === Type.ASSIGN) {
            if (
                lastSymbol === null ||
                lastToken === null ||
                lastToken.type !== Type.SYMBOL
            ) {
                return Err.err("no LHS for assignment");
            }
            // Remove most recent symbol since it's the LHS.
            if (assignSymbol !== null) {
                values[assignSymbol].pop();
            }
            lastSymbol = lastSymbol;
            assignSymbol = lastSymbol?.value[0];
            lastToken = token;
            continue;
        }

        return Err.err("unknown output token");
    }

    return values;
};

export const parse = (raw: string): Possible<QMKRules> => {
    // TODO multiline comments
    lexer.reset(raw);
    for (let here of lexer) {
        console.log(here);
    }

    const tokens = tokenize(raw, rulesTokens);
    if (Err.isErr(tokens)) {
        return tokens.with("parse error");
    }

    const extracted = extract(tokens);
    if (Err.isErr(extracted)) {
        return extracted.with("extract error");
    }

    const layouts: string[] = [];
    if (extracted.LAYOUT !== undefined) {
        layouts.push(extracted.LAYOUT[0]);
    }
    if (extracted.LAYOUTS !== undefined) {
        layouts.push(...extracted.LAYOUTS);
    }

    return {
        layouts,
        viaEnable: !!extracted.VIA_ENABLE,
        defaultFolder: extracted.DEFAULT_FOLDER?.[0],
        raw: extracted,
    };
};
