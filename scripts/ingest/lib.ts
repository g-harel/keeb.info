import fs from "fs";
import json5 from "json5";

import {Err, Possible} from "../../internal/possible";

export const hexToInt = (hex: string): number | null => {
    let result = Number(hex);
    if (isNaN(result)) {
        result = Number("0x" + hex);
    }
    if (isNaN(result)) {
        return null;
    }
    return result;
};

export const log = (messages: string | string[], data?: string | string[]) => {
    messages = [messages].flat(1);
    data = [data || []].flat(1);
    const message = `> ${messages.join(": ")}`;
    console.log([message, ...data].join("\n\t"));
};

export const readFile = (filePath: string): Possible<string> => {
    if (!fs.existsSync(filePath)) {
        return Err.err(`not found: ${filePath}`);
    }
    return fs.readFileSync(filePath).toString("utf-8");
};

export const readJsonFile = <T>(filePath: string): Possible<T> => {
    try {
        const contents = readFile(filePath);
        if (Err.isErr(contents)) return contents;
        return json5.parse(contents);
    } catch (e) {
        return Err.err(filePath).with(String(e));
    }
};
