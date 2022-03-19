import moo, {Token} from "moo";

import {Possible, isErr, newErr} from "../../../internal/possible";

export interface QMKRules {
    layouts: string[];
    viaEnable: boolean;
    defaultFolder?: string;
    raw: Record<string, string[]>;
}

const EVAL = "EVAL";
const INCLUDE = "INCLUDE"; // TODO
const WHITESPACE = "WHITESPACE";
const COMMENT = "COMMENT";
const ASSIGN = "ASSIGN";
const SYMBOL = "SYMBOL";
const CONDITIONAL = "CONDITIONAL";

// TODO support symbols that contain eq "-test=true"
const lexer = moo.states({
    default: {
        [COMMENT]: /#[^\n]*/,
        [WHITESPACE]: [
            {match: /[ \t]+/},
            {match: /\\/},
            {match: /\n/, lineBreaks: true},
        ],

        // Unsupported
        [CONDITIONAL]: {match: ["ifeq", "ifdef", "else", "endif"], error: true},
        [EVAL]: /\$\([^#\n]*/,
        [INCLUDE]: /include/,

        [ASSIGN]: /[\:\+]?=/,
        [SYMBOL]: /[^\s]+/,
    },
});

const extract = (tokens: Token[]): Possible<Record<string, string[]>> => {
    const values: Record<string, string[]> = {};

    const semanticTokens = tokens.filter((token) => {
        return token.type !== COMMENT && token.type !== WHITESPACE;
    });

    // Fail when token is unsupported.
    for (const token of semanticTokens) {
        if (
            token.type === CONDITIONAL ||
            token.type === EVAL ||
            token.type === INCLUDE
        ) {
            return newErr(JSON.stringify(token)).err.fwd("unsupported token");
        }
    }

    // State.
    let lastSymbol: Token | null = null;
    let assignSymbol: string | null = null;
    let lastToken: Token | null = null;

    for (let i = 0; i < semanticTokens.length; i++) {
        const token = semanticTokens[i];

        if (token.type === SYMBOL) {
            // Ignore when burning.
            if (assignSymbol === null) {
                // Two symbols following each other with no assignment.
                if (lastToken !== null && lastToken.type === SYMBOL) {
                    return newErr(JSON.stringify(lastToken)).err.fwd(
                        "loose symbol",
                    );
                }
            } else {
                // Assign when demanded.
                if (values[assignSymbol] === undefined) {
                    values[assignSymbol] = [];
                }
                values[assignSymbol].push(token.value);
            }
            lastSymbol = token;
            assignSymbol = assignSymbol;
            lastToken = token;
            continue;
        }

        if (token.type === ASSIGN) {
            if (
                lastSymbol === null ||
                lastToken === null ||
                lastToken.type !== SYMBOL
            ) {
                return newErr("no LHS for assignment");
            }
            // Remove most recent symbol since it's the LHS.
            if (assignSymbol !== null) {
                values[assignSymbol].pop();
            }
            lastSymbol = lastSymbol;
            assignSymbol = lastSymbol?.value;
            lastToken = token;
            continue;
        }

        return newErr("unknown output token");
    }

    return values;
};

export const parse = (raw: string): Possible<QMKRules> => {
    const tokens: Token[] = [];
    try {
        lexer.reset(raw);
        for (let token of lexer) {
            tokens.push(token);
        }
    } catch (e) {
        return newErr(String(e)).err.fwd("parse error");
    }

    const extracted = extract(tokens);
    if (isErr(extracted)) {
        return extracted.err.fwd("extract error");
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
