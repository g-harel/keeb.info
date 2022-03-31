import lunr from "lunr";

// TODO use this.
// TODO add query methods.
export class SearchIndex<T> {
    private index: lunr.Index;

    private constructor(index: lunr.Index) {
        this.index = index;
    }

    public static fromDocuments<T>(
        documents: T[],
        refField: string,
        fields: string[],
    ): SearchIndex<T> {
        const idx = lunr(function () {
            const $idx = this;
            $idx.ref(refField);
            fields.forEach((field) => $idx.field(field));
            documents.forEach((doc) => $idx.add(doc as any));
        });

        return new SearchIndex(idx);
    }

    public static fromSerialized<T>(idx: string): SearchIndex<T> {
        return new SearchIndex(lunr.Index.load(JSON.parse(idx)));
    }

    public serialize(): string {
        return JSON.stringify(this.index);
    }
}
