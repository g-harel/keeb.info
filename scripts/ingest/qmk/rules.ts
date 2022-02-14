import {InputToken, tokenize} from "../../../internal/parsing/tokenizer";
import {Err, Possible} from "../../../internal/possible";

export interface QMKRules {
    MCU: string;
}

const rulesTokens: InputToken[] = [
    {type: "EVAL", pattern: "\\$\\([^#\\n]*"},
    {type: "INCLUDE", pattern: "include"}, // TODO not being found for rgbkb/sol
    {type: "WHITESPACE", pattern: "\\s+"},
    {type: "COMMENT", pattern: "#[^\\n]*\\n?"},
    {type: "OP_EQ", pattern: "\\[:\\+\\]?="},
    {type: "ANY_SYMBOL", pattern: "[^\\s]+"},
];

export const parse = (raw: string): Possible<QMKRules> => {
    const tokens = tokenize(raw, rulesTokens);
    if (Err.isErr(tokens)) {
        return tokens.with("parse error");
    }

    console.log(tokens);

    return {
        MCU: "",
    };
};
