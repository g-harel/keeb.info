import {Document, IndexOptionsForDocumentSearch} from "flexsearch";

import {Possible, newErr} from "./possible";

interface SerializedSearchIndex {
    index: any;
    options: any;
    documents: any[];
}

const ID_FIELD = "__id__";

// TODO replace lunr with flexsearch
// TODO compress fields?
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

        // TODO tuned options.
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
    private documents: T[]; // TODO might not be needed
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
        console.log("exported", exportedIndex);

        const data: SerializedSearchIndex = {
            index: exportedIndex,
            options: this.options,
            documents: this.documents,
        };
        return JSON.stringify(data);
    }

    public search(query: string): Possible<T[]> {
        return this.index.search(query) as any;
        const results: T[] = [];
        // for (const result of this.index.search(query)) {
        //     const document = this.documents[result.ref];
        //     if (document === undefined) {
        //         return newErr(result.ref).fwd("missing ref");
        //     }
        //     results.push(document);
        // }
        return results;
    }
}
