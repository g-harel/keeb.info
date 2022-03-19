import fs from "fs";
import json5 from "json5";

import {Possible, isErr, newErr} from "../../internal/possible";

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
        return newErr(`not found: ${filePath}`);
    }
    return fs.readFileSync(filePath).toString("utf-8");
};

export const readJsonFile = <T>(filePath: string): Possible<T> => {
    try {
        const contents = readFile(filePath);
        if (isErr(contents)) return contents;
        return json5.parse(contents);
    } catch (e) {
        return newErr(filePath).err.fwd(String(e));
    }
};
