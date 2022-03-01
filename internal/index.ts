import lunr from "lunr";

export const serializedIndex = <T extends object>(
    documents: T[],
    ref: string,
    fields: string[],
): string => {
    const idx = lunr(function () {
        const $idx = this;

        $idx.ref(ref);
        fields.forEach((field) => $idx.field(field));
        documents.forEach((doc) => $idx.add(doc));
    });

    return JSON.stringify(idx);
};
