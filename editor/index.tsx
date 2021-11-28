import React from "react";
import ReactDOM from "react-dom";
import {createGlobalStyle} from "styled-components";
import {Routes, Route, BrowserRouter} from "react-router-dom";

import {BACKGROUND_COLOR} from "./cons";
import {Demo} from "./pages/demo";
import {Header} from "./header";
import {Account} from "./pages/account";

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html, body {
        background-color: ${BACKGROUND_COLOR};
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0;
    }

    html {
        height: 100%;
        display: flex;
    }

    body {
        display: flex;
        flex-grow: 1;
    }

    #root {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
`;

const App = () => (
    <>
        <GlobalStyle />
        <BrowserRouter>
            <Header />
            <Routes>
                {/* TODO path variables */}
                <Route path="account" element={<Account />} />
                <Route path="demo" element={<Demo />} />
                {/* TODO 404 */}
            </Routes>
        </BrowserRouter>
    </>
);

ReactDOM.render(<App />, document.getElementById("root"));
