import {Document, IndexOptionsForDocumentSearch} from "flexsearch";

import {Possible, newErr} from "./possible";

interface SerializedSearchIndex {
    index: any;
    options: any;
}

const ID_FIELD = "__id__";

export class SearchIndex<T> {
    // TODO index on arbitrary field.
    public static fromDocuments<T>(
        documentList: T[],
        fields: string[],
    ): SearchIndex<T> {
        const options: IndexOptionsForDocumentSearch<T> = {
            document: {
                id: ID_FIELD,
                index: fields,
            },
        };

        // TODO tune options.
        const index = new Document<T>(options);
        for (let i = 0; i < documentList.length; i++) {
            const doc = documentList[i];
            (doc as any)[ID_FIELD] = i;
            index.add(doc);
        }

        return new SearchIndex(index, options);
    }

    public static fromSerialized<T>(
        serialized: string,
    ): Possible<SearchIndex<T>> {
        let data: SerializedSearchIndex;
        try {
            data = JSON.parse(serialized);
        } catch (e) {
            return newErr(String(e)).fwd("deserialize index");
        }

        const index = new Document<T>(data.options);
        for (const [key, d] of Object.entries(data.index)) {
            index.import(key, d as any);
        }

        return new SearchIndex(index, data.options);
    }

    private index: Document<T>;
    private options: IndexOptionsForDocumentSearch<T>;

    private constructor(
        index: Document<T>,
        options: IndexOptionsForDocumentSearch<T>,
    ) {
        this.index = index;
        this.options = options;
    }

    public async serialize(): Promise<string> {
        let wasExported = false;
        const exportedIndex: Record<string, any> = {};
        this.index.export((key, data: any) => {
            wasExported = true;
            if (data !== undefined) {
                data = JSON.parse(data);
            }
            exportedIndex[key] = data;
        });

        // Wait for signal that index has been exported.
        // TODO there has to be a better way.
        const exportDetectIntervalMS = 100;
        const exportWaitIntervalMS = 1000;
        await new Promise((res) => {
            setInterval(() => {
                if (wasExported) {
                    setTimeout(res, exportWaitIntervalMS);
                }
            }, exportDetectIntervalMS);
        });

        const data: SerializedSearchIndex = {
            index: exportedIndex,
            options: this.options,
        };
        return JSON.stringify(data);
    }

    public search(query: string): Possible<number[]> {
        const searchResults = this.index.search(query);

        // TODO order search results by quality across fields.
        const results: number[] = [];
        for (const fieldResult of searchResults) {
            for (const resultID of fieldResult.result) {
                results.push(resultID as number);
            }
        }
        return results;
    }
}
