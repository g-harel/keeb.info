import {
    InputToken,
    OutputToken,
    tokenize,
} from "../../../internal/parsing/tokenizer";
import {Err, Possible} from "../../../internal/possible";

export interface QMKRules {
    MCU: string;
}

enum Type {
    EVAL,       // 0
    INCLUDE,    // 1
    WHITESPACE, // 2
    COMMENT,    // 3
    ASSIGN,     // 4
    SYMBOL,     // 5
}

const rulesTokens: InputToken<Type>[] = [
    {type: Type.COMMENT, pattern: "#[^\\n]*\\n?"},
    {type: Type.WHITESPACE, pattern: "\\s+"},
    {type: Type.WHITESPACE, pattern: "\\\\"},

    // Semantic.
    {type: Type.EVAL, pattern: "\\$\\([^#\\n]*"},
    {type: Type.INCLUDE, pattern: "include"}, // TODO not being found for rgbkb/sol
    {type: Type.ASSIGN, pattern: "[\\:\\+]?="},
    {type: Type.SYMBOL, pattern: "[^\\s]+"},
];

const extract = (
    tokens: OutputToken<Type>[],
): Possible<Record<string, string[]>> => {
    const values: Record<string, string[]> = {};

    const semanticTokens = tokens.filter((token) => {
        return token.type !== Type.COMMENT && token.type !== Type.WHITESPACE;
    });

    // State.
    let lastSymbol: OutputToken<Type> | null = null;
    let burnSymbols: boolean = false;
    let assignSymbol: string | null = null;
    let lastToken: OutputToken<Type> | null = null;

    for (let i = 0; i < semanticTokens.length; i++) {
        const token = semanticTokens[i];

        // Burn all symbols following weird sequences.
        if (token.type === Type.INCLUDE || token.type === Type.EVAL) {
            lastSymbol = null;
            burnSymbols = true;
            assignSymbol = null;
            lastToken = token;
            continue;
        }

        if (token.type === Type.SYMBOL) {
            // Ignore when burning.
            if (burnSymbols !== true) {
                if (assignSymbol === null) {
                    // Two symbols following each other with no assignment.
                    if (lastToken !== null && lastToken.type === Type.SYMBOL) {
                        return Err.err(JSON.stringify(lastToken)).with(
                            "loose symbol",
                        ).with(JSON.stringify(token));
                    }
                } else {
                    // Assign when demanded.
                    if (values[assignSymbol] === undefined) {
                        values[assignSymbol] = [];
                    }
                    values[assignSymbol].push(token.value[0]);
                }
            }
            lastSymbol = token;
            burnSymbols = burnSymbols;
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
            burnSymbols = false;
            assignSymbol = lastSymbol?.value[0];
            lastToken = token;
            continue;
        }

        return Err.err("unknown output token");
    }

    return values;
};

export const parse = (raw: string): Possible<QMKRules> => {
    const tokens = tokenize(raw, rulesTokens);
    if (Err.isErr(tokens)) {
        return tokens.with("parse error");
    }

    console.log(extract(tokens));

    return {
        MCU: "",
    };
};
