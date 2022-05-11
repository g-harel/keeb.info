import React, {useEffect, useState} from "react";
import styled from "styled-components";

import {Layout, minmax} from "../../internal/layout";
import {subtract} from "../../internal/point";
import {isErr} from "../../internal/possible";
import {ExplodedLayout} from "../../internal/rendering/views/exploded-layout";
import {SearchIndex} from "../../internal/search_index";
import {KeyboardMetadata} from "../../scripts/ingest/export";
import {Defer} from "../components/defer";
import {loadKeyboardMetadata, loadSearchData} from "../search";

const StyledWrapper = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    padding: 2rem 1rem 0;
`;

const StyledItem = styled.div`
    margin-bottom: 1rem;
    padding: 1.5rem 2rem 2rem;

    h2 {
        margin: 0;
        padding-left: 1rem;
    }

    h4 {
        margin: 0 0 1rem;
        padding-left: 1rem;
    }

    svg {
        width: 100%;
        height: auto;
    }
`;

// TODO make downloadable.
export const ResultLayout = (props: {name: string}) => {
    const [keyboardMetadata, setKeyboardMetadata] =
        useState<null | KeyboardMetadata>(null);
    const [keyboardMetadataError, setKeyboardMetadataError] = useState<
        null | string
    >(null);

    useEffect(() => {
        const load = async () => {
            const index = await loadKeyboardMetadata(props.name);
            if (isErr(index)) {
                // TODO log this instead and show generic message.
                setKeyboardMetadataError(index.err.print());
                return;
            }
            setKeyboardMetadata(index);
        };
        load();
    }, []);

    if (keyboardMetadataError !== null) {
        return <>{keyboardMetadataError}</>;
    }

    if (keyboardMetadata === null) {
        return <>loading...</>;
    }

    const {name, layout} = keyboardMetadata;
    const [width, height] = subtract(...minmax(layout));
    const defaultWidth = 838;
    return (
        <StyledItem>
            <h2>{name}</h2>
            <h4>{layout.fixedKeys.length} keys</h4>
            <Defer
                width={`${defaultWidth}px`}
                height={`${(defaultWidth / width) * height}px`}
            >
                <ExplodedLayout
                    layout={layout as Layout}
                    width={defaultWidth}
                />
            </Defer>
        </StyledItem>
    );
};

export const Search = () => {
    // TODO combine into possible value
    const [searchIndex, setSearchIndex] =
        useState<null | SearchIndex<KeyboardMetadata>>(null);
    const [searchIndexError, setSearchIndexError] = useState<null | string>(
        null,
    );

    // TODO
    useEffect(() => {
        const load = async () => {
            const index = await loadSearchData();
            if (isErr(index)) {
                // TODO log this instead and show generic message.
                setSearchIndexError(index.err.print());
                return;
            }
            setSearchIndex(index);
        };
        load();
    }, []);

    if (searchIndexError !== null) {
        return <>{searchIndexError}</>;
    }

    if (searchIndex === null) {
        return <>loading...</>;
    }

    const query = "wilba";
    const results = searchIndex.search(query);
    if (isErr(results)) {
        return <>{results.err.print()}</>;
    }

    return (
        <StyledWrapper>
            <h1>{query}</h1>
            {results.slice(0, 10).map((result) => (
                <ResultLayout key={result} name={result} />
            ))}
        </StyledWrapper>
    );
};
