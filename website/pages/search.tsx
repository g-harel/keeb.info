import {Possible, isErr} from "possible-ts";
import React, {useEffect, useState} from "react";
import styled from "styled-components";

import {Layout, minmax} from "../../internal/layout";
import {subtract} from "../../internal/point";
import {ExplodedLayout} from "../../internal/rendering/views/exploded-layout";
import {SearchIndex} from "../../internal/search_index";
import {KeyboardMetadata} from "../../scripts/ingest/export";
import {Defer} from "../components/defer";
import {getQuery} from "../internal/location";
import {loadKeyboardMetadata, loadSearchData} from "../internal/api";

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

export const ResultLayout = (props: {name: string}) => {
    const [keyboard, setKeyboard] = useState<null | Possible<KeyboardMetadata>>(
        null,
    );

    useEffect(() => {
        const load = async () =>
            setKeyboard(await loadKeyboardMetadata(props.name));
        load();
    }, []);

    if (keyboard === null) {
        return <>loading...</>;
    }
    if (isErr(keyboard)) {
        return <>{keyboard.err.print()}</>;
    }

    console.log(keyboard);
    const {name, layout} = keyboard;
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
    const [idx, setIdx] = useState<null | Possible<SearchIndex>>(null);

    useEffect(() => {
        const load = async () => setIdx(await loadSearchData());
        load();
    }, []);

    const query = getQuery();
    if (isErr(query)) {
        return <>no results</>;
    }

    if (idx === null) {
        return <>loading...</>;
    }

    if (isErr(idx)) {
        return <>{idx.err.print()}</>;
    }

    const results = idx.search(query);
    if (isErr(results)) {
        return <>{results.err.print()}</>;
    }

    if (results.length === 0) {
        return <>no results</>;
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
