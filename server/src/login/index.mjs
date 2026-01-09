import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Login from "./Login.js";

function render() {
    const root = createRoot(document.querySelector("#root"))

    root.render(
        <StrictMode>
            <Login/>
        </StrictMode>
    )
}

render()