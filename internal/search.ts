import lunr from "lunr";

// TODO use this.
// TODO add query methods.
export class Search<T> {
    private index: lunr.Index;

    private constructor(index: lunr.Index) {
        this.index = index;
    }

    public static fromDocuments<T>(
        documents: T[],
        refField: string,
        fields: string[],
    ): Search<T> {
        const idx = lunr(function () {
            const $idx = this;

            $idx.ref(refField);
            fields.forEach((field) => $idx.field(field));
            documents.forEach((doc) => $idx.add(doc as any));
        });

        return new Search(idx);
    }

    public static fromSerialized<T>(idx: string): Search<T> {
        return new Search(lunr.Index.load(JSON.parse(idx)));
    }

    public serialize(): string {
        return JSON.stringify(this.index);
    }
}

export const createSerializedIndex = <T extends object>(
    documents: T[],
    refField: string,
    fields: string[],
): string => {
    const idx = lunr(function () {
        const $idx = this;

        $idx.ref(refField);
        fields.forEach((field) => $idx.field(field));
        documents.forEach((doc) => $idx.add(doc));
    });

    return JSON.stringify(idx);
};

export const deserializeIndex = (idx: string) => {
    return lunr.Index.load(JSON.parse(idx));
};
