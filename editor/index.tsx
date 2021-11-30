import React from "react";
import ReactDOM from "react-dom";
import {createGlobalStyle} from "styled-components";
import {Routes, Route, BrowserRouter} from "react-router-dom";

import {BACKGROUND_COLOR} from "./cons";
import {Demo} from "./pages/demo";
import {Header} from "./header";
import {Account} from "./pages/account";
import {Layouts} from "./pages/layouts";

// Global styles, similar to traditional css.
const GlobalStyle = createGlobalStyle`
    html {
        background-color: ${BACKGROUND_COLOR};
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        margin: 0;
        height: 100%;
    }

    body {
        margin: 0;
        min-height: 100%;

        // Dots background.
        background-color: #f4ffdf;
        background-image: radial-gradient(#ffe2e8 0.95px, transparent 0.95px), radial-gradient(#ffe2e8 0.95px, #fff3f5 0.95px);
        background-size: 18px 18px;
        background-position: 0 0, 9px 9px;
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
                <Route path="/" element={<Layouts />} />
                <Route path="account" element={<Account />} />
                <Route path="/demo" element={<Demo />} />
                {/* TODO 404 */}
            </Routes>
        </BrowserRouter>
    </>
);

ReactDOM.render(<App />, document.getElementById("root"));
