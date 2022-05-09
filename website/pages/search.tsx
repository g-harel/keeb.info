
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Layout, minmax } from "../../internal/layout";
import { subtract } from "../../internal/point";
import { isErr, Possible } from "../../internal/possible";
import { LayoutKeymap } from "../../internal/rendering/views/layout-keymap";
import { SearchIndex } from "../../internal/search_index";
import { Defer } from "../components/defer";
import {loadKeyboardMetadata, loadSearchData} from "../search";
import {KeyboardMetadata} from "../../scripts/ingest/export";

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
    const [keyboardMetadata, setKeyboardMetadata] = useState<KeyboardMetadata>();
    const [keyboardMetadataError, setKeyboardMetadataError] = useState<null | string>();

    useEffect(() => {
        const load = async () => {
            const index = await loadKeyboardMetadata(props.name);
            if (isErr(index)) {
                // TODO log this instead and show generic message.
                setKeyboardMetadataError(index.err.print());
                return;
            }
            setKeyboardMetadata(index);
        }
        load();
    }, []);

    if (keyboardMetadataError !== null) {
        return keyboardMetadataError;
    }

    const [width, height] = subtract(...minmax(keyboardMetadata.layout));
    const defaultWidth = 838;
    return (
        <StyledItem>
            <h2>{props.name}</h2>
            <h4>{layout.fixedKeys.length} keys</h4>
            <Defer
                width={`${defaultWidth}px`}
                height={`${(defaultWidth / width) * height}px`}
            >
                <LayoutKeymap
                    layout={layout as Layout}
                    keymap={keymap}
                    width={defaultWidth}
                />
            </Defer>
        </StyledItem>
    );
};

export const Search = () => {
    const [searchIndex, setSearchIndex] = useState<SearchIndex<KeyboardMetadata>>();
    const [searchIndexError, setSearchIndexError] = useState<null | string>();

    useEffect(() => {
        const load = async () => {
            const index = await loadSearchData();
            if (isErr(index)) {
                // TODO log this instead and show generic message.
                setSearchIndexError(index.err.print());
                return;
            }
            setSearchIndex(index);
        }
        load();
    }, []);

    return (
        <StyledWrapper>
            test
        </StyledWrapper>
    );
};
