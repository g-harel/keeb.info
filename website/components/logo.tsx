import React from "react";
import styled from "styled-components";

import {ReactProps} from "../../internal/react";

export interface LogoProps extends ReactProps {
    size: string;
}

const GroupWrapper = styled.g`
    fill: currentColor;
`;

export const Logo = (props: LogoProps) => (
    <div style={{paddingTop: `calc(${props.size} * 0.1)`}}>
        <svg
            version="1.0"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width={props.size}
            height={`calc(${props.size} * 0.78)`}
            viewBox="0 0 1000 780"
            enableBackground="new 0 0 1000 780"
            xmlSpace="preserve"
        >
            <GroupWrapper>
                <path
                    d="M939.863,225.015H60.137c-30.366,0-54.982,24.616-54.982,54.983c0,30.367,24.616,54.982,54.982,54.982
		h307.124L150.09,552.152c-21.473,21.471-21.473,56.285,0,77.758c10.735,10.734,24.808,16.102,38.878,16.102
		c14.072,0,28.144-5.367,38.88-16.102l217.17-217.172v307.125c0,30.367,24.616,54.982,54.982,54.982s54.982-24.615,54.982-54.982
		V412.738L772.154,629.91c10.735,10.734,24.808,16.102,38.878,16.102s28.143-5.367,38.879-16.102
		c21.472-21.473,21.472-56.287,0-77.758L632.739,334.98h307.124c30.366,0,54.982-24.615,54.982-54.982
		C994.846,249.631,970.229,225.015,939.863,225.015z"
                />
                <path
                    d="M280.067,115.05h439.863c30.367,0,54.982-24.616,54.982-54.983c0-30.366-24.615-54.982-54.982-54.982
		H280.067c-30.366,0-54.982,24.616-54.982,54.982C225.085,90.434,249.701,115.05,280.067,115.05z"
                />
            </GroupWrapper>
        </svg>
    </div>
);
