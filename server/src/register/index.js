import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Register from "./Register.js";

function render() {
    const root = createRoot(document.querySelector("#root"))

    root.render(
        <StrictMode>
            <Register />
        </StrictMode>
    )
}

render()