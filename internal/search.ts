import {Document} from "flexsearch";

import {Possible, newErr} from "./possible";

interface SerializedSearchIndex {
    index: any;
    documents: Record<string, any>;
}

// TODO replace lunr with flexsearch

export class SearchIndex<T> {
    public static fromDocuments<T>(
        documentList: T[],
        refField: string, // TODO remove and use list index.
        fields: string[],
    ): SearchIndex<T> {
        // TODO options.
        const index = new Document<T>({
            document: {
                id: refField,
                index: fields,
            },
        });

        for (const doc of documentList) {
            index.add(doc);
        }

        return new SearchIndex(index, documentList);
    }

    public static fromSerialized<T>(serialized: string): SearchIndex<T> {
        const data: SerializedSearchIndex = JSON.parse(serialized);
        // TODO serialize flex
        return new SearchIndex(lunr.Index.load(data.index), data.documents);
    }

    private index: Document<T>;
    private documents: Record<string, T>; // TODO convert to string.

    private constructor(index: Document<T>, documents: Record<string, T>) {
        this.index = index;
        this.documents = documents;
    }

    public serialize(): string {
        const data: SerializedSearchIndex = {
            index: this.index,
            documents: this.documents,
        };
        return JSON.stringify(data);
    }

    public search(query: string): Possible<T[]> {
        const results: T[] = [];
        for (const result of this.index.search(query)) {
            const document = this.documents[result.ref];
            if (document === undefined) {
                return newErr(result.ref).fwd("missing ref");
            }
            results.push(document);
        }
        return results;
    }
}
