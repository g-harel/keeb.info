import {Index, IndexOptions} from "flexsearch";
import {Possible, isErr, mightErr} from "possible-ts";

interface SerializedSearchIndex {
    index: any;
    options: any;
}

type ID_TYPE = string;

export class SearchIndex {
    // TODO index on arbitrary field.
    public static fromDocuments<T extends Record<string, any>>(
        documents: Record<ID_TYPE, T>,
        fieldExtractor: (document: T) => string[],
    ): SearchIndex {
        const options: IndexOptions<T> = {};

        // TODO tune options.
        const index = new Index(options);
        for (const [id, doc] of Object.entries(documents)) {
            for (const str of fieldExtractor(doc)) {
                index.add(id, str);
            }
        }

        return new SearchIndex(index, options);
    }

    public static fromSerialized(serialized: string): Possible<SearchIndex> {
        const data = mightErr(() => {
            return JSON.parse(serialized) as SerializedSearchIndex;
        });
        if (isErr(data)) {
            return data.err.describe("deserialize index");
        }

        const deserializedIndex = mightErr(() => {
            const index = new Index(data.options);
            for (const [key, d] of Object.entries(data.index)) {
                index.import(key, d as any);
            }
            return index;
        });
        if (isErr(deserializedIndex)) {
            return deserializedIndex.err.describe("corrupted index");
        }

        return new SearchIndex(deserializedIndex, data.options);
    }

    private index: Index;
    private options: IndexOptions<void>;

    private constructor(index: Index, options: IndexOptions<void>) {
        this.index = index;
        this.options = options;
    }

    public async serialize(): Promise<string> {
        let wasExported = false;
        const exportedIndex: Record<string, any> = {};

        await this.index.export((key: any, data: any) => {
            // https://github.com/nextapps-de/flexsearch/issues/273
            const fixedKey = key.split(".").slice(-1)[0];
            wasExported = true;
            if (data !== undefined) {
                data = JSON.parse(data);
            }
            exportedIndex[fixedKey] = data;
        });

        // Wait for signal that index has been exported.
        // TODO there has to be a better way.
        const exportDetectIntervalMS = 10;
        const exportWaitIntervalMS = 100;
        await new Promise((res) => {
            const intervalID = setInterval(() => {
                if (wasExported) {
                    clearInterval(intervalID);
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

    public search(query: string): Possible<ID_TYPE[]> {
        const searchResults = this.index.search(query);

        // TODO order search results by quality across fields.
        const results: ID_TYPE[] = [];
        for (const resultID of searchResults) {
            results.push(resultID as ID_TYPE);
        }
        return results;
    }
}
