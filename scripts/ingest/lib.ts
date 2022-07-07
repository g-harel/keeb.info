import fs from "fs";
import json5 from "json5";
import path from "path";
import {Possible, isErr, mightErr, newErr} from "possible-ts";

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
    const contents = readFile(filePath);
    if (isErr(contents)) return contents;

    const parsedContents = mightErr(() => json5.parse(contents));
    if (isErr(parsedContents)) return parsedContents.err.describe(filePath);

    return parsedContents;
};

export const writeFile = (
    filePath: string,
    contents: string,
): Possible<void> => {
    const dirname = path.dirname(filePath);
    const possibleErr = mightErr(() => {
        if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, {recursive: true});
        fs.writeFileSync(filePath, contents);
    });
    if (isErr(possibleErr)) possibleErr.err.describe(filePath);
};
