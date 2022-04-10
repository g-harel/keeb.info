import {Document, IndexOptionsForDocumentSearch} from "flexsearch";

import {newErr, Possible} from "./possible";

interface SerializedSearchIndex {
    index: any;
    options: any;
    documents: any[];
}

const ID_FIELD = "__id__";

// TODO compress document list during serialization
export class SearchIndex<T> {
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

        return new SearchIndex(index, documentList, options);
    }

    public static fromSerialized<T>(serialized: string): SearchIndex<T> {
        const data: SerializedSearchIndex = JSON.parse(serialized);

        const index = new Document<T>(data.options);
        for (const [key, d] of Object.entries(data.index)) {
            index.import(key, d as any);
        }

        return new SearchIndex(index, data.documents, data.options);
    }

    private index: Document<T>;
    private documents: T[];
    private options: IndexOptionsForDocumentSearch<T>;

    private constructor(
        index: Document<T>,
        documents: T[],
        options: IndexOptionsForDocumentSearch<T>,
    ) {
        this.index = index;
        this.documents = documents;
        this.options = options;
    }

    public async serialize(): Promise<string> {
        let wasExported = false;
        const exportedIndex: Record<string, T> = {};
        this.index.export((key, data) => {
            wasExported = true;
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
            documents: this.documents,
        };
        return JSON.stringify(data);
    }

    public search(query: string): Possible<T[]> {
        const searchResults = this.index.search(query);

        // TODO order search results by quality across fields.
        const results: T[] = [];
        for (const fieldResult of searchResults) {
            for (const resultID of fieldResult.result) {
                const document = this.documents[resultID as number];
                if (document === undefined) {
                    return newErr(String(resultID)).fwd("missing ID");
                }
                results.push(document);
            }
        }
        return results;
    }
}
