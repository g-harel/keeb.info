import lunr from "lunr";

import {Possible, newErr} from "./possible";

interface SerializedSearchIndex {
    index: any;
    documents: Record<string, any>;
}

export class SearchIndex<T> {
    public static fromDocuments<T>(
        documentList: T[],
        refField: string,
        fields: string[],
    ): SearchIndex<T> {
        const documentsMap: Record<string, T> = {};

        const idx = lunr(function () {
            const $idx = this;

            // Set the "ref" field (index).
            $idx.ref(refField);

            // Set the other fields to be indexed.
            fields.forEach((field) => $idx.field(field));

            // Add all documents to index and ref map.
            documentList.forEach((doc: any) => {
                $idx.add(doc);
                documentsMap[doc[refField]] = doc;
            });
        });

        return new SearchIndex(idx, documentsMap);
    }

    public static fromSerialized<T>(serialized: string): SearchIndex<T> {
        const data: SerializedSearchIndex = JSON.parse(serialized);
        return new SearchIndex(lunr.Index.load(data.index), data.documents);
    }

    private index: lunr.Index;
    private documents: Record<string, T>;

    private constructor(index: lunr.Index, documents: Record<string, T>) {
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
