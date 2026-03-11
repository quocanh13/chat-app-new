import { createRoot } from "react-dom/client";
import ChatApp from "./ChatApp.js";



function render() {
    const root = createRoot(document.querySelector("#root"))
    root.render(
        <ChatApp />
    )
}

render()
