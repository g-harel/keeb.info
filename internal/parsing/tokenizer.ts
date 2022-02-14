import {Err, Possible} from "../possible";

export interface InputToken {
    type: string;
    // RegEx-like pattern.
    // Will be edited during tokenization before being converted to actual RegEx.
    // Multiline.
    pattern: string;
}

export interface OutputToken {
    type: string;
    position: number;

    // First item always exists and is the full token match.
    // Following items contain capture group values.
    value: string[];
}

// regex flags: dgimsuy

// Input tokens should be given in descending order of priority.
export const tokenize = (
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
