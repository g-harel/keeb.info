import {Err, Possible} from "../../../internal/possible";

export interface QMKRules {
    MCU: string;
}

interface InputToken {
    type: string;
    // RegEx-like pattern.
    // Will be edited during tokenization before being converted to actual RegEx.
    // Multiline.
    pattern: string;
}

interface OutputToken {
    type: string;
    position: number;

    // First item always exists and is the full token match.
    // Following items contain capture group values.
    value: string[];
}

// regex flags: dgimsuy

// Input tokens should be given in descending order of priority.
const tokenize = (
    raw: string,
    inputTokens: InputToken[],
): Possible<OutputToken[]> => {
    const tokensWithPattern = inputTokens.map((token) => {
        return {
            type: token.type,
            pattern: new RegExp(`^${token.pattern}`, "m"),
        };
    });

    const outputTokens: OutputToken[] = [];
    let position = 0;
    while (position < raw.length - 1) {
        let matched = false;
        for (const token of tokensWithPattern) {
            const pattern = new RegExp(token.pattern.source);
            const match = pattern.exec(raw.slice(position));
            if (match === null) {
                continue;
            }

            if (match[0].length === 0) {
                return Err.err(raw.slice(position, position + 16))
                    .with(String(pattern))
                    .with("tokenization loop");
            }

            outputTokens.push({
                position,
                type: token.type,
                value: [...match],
            });
            position += match[0].length;
            matched = true;
            break;
        }
        if (matched) continue;

        // No matching input token.
        return Err.err(raw.slice(position, position + 16)).with(
            `unknown token at position ${position}`,
        );
    }
    return outputTokens;
};

// TODO: /, :=, >&2, 'CLI, %/,%,$(dir), $(lastword, $(BUILD_DIR)
const rulesTokens: InputToken[] = [
    {type: "INCLUDE", pattern: "include"}, // TODO not being found for rgbkb/sol
    {type: "WHITESPACE", pattern: "\\s+"},
    {type: "COMMENT", pattern: "#[^\\n]*\\n?"},
    {type: "OP_EQ", pattern: "="},
    {type: "OP_INC", pattern: "\\+="},
    {type: "OP_EQ_COLON", pattern: "\\:="},
    {type: "ANY_SYMBOL", pattern: "[^\\s]+"},
];

export const parse = (raw: string): Possible<QMKRules> => {
    const tokens = tokenize(raw, rulesTokens);
    if (Err.isErr(tokens)) {
        return tokens.with("parse error");
    }

    for (const token of tokens) {
        if (token.type === "INCLUDE") {
            console.log(token);
        }
    }

    return {
        MCU: "",
    };
};
