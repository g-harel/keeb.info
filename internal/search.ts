import {Document, IndexOptionsForDocumentSearch} from "flexsearch";

import {Possible, newErr} from "./possible";

interface SerializedSearchIndex {
    index: any;
    options: any;
    documents: any[];
}

// TODO replace lunr with flexsearch
// TODO compress fields?
export class SearchIndex<T> {
    public static fromDocuments<T>(
        documentList: T[],
        refField: string,
        fields: string[],
    ): SearchIndex<T> {
        const options: IndexOptionsForDocumentSearch<T> = {
            document: {
                id: refField,
                index: fields,
            },
        };

        // TODO tuned options.
        const index = new Document<T>(options);
        for (const doc of documentList) {
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

    public serialize(): string {
        const exportedIndex: Record<string, T> = {};
        this.index.export((key, data) => {
            exportedIndex[key] = data;
        });

        const data: SerializedSearchIndex = {
            index: exportedIndex,
            options: this.options,
            documents: this.documents,
        };
        return JSON.stringify(data);
    }

    public search(query: string): Possible<T[]> {
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
