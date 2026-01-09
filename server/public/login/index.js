import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Login from "./Login.js";
import { jsx as _jsx } from "react/jsx-runtime";
function render() {
  const root = createRoot(document.querySelector("#root"));
  root.render(/*#__PURE__*/_jsx(StrictMode, {
    children: /*#__PURE__*/_jsx(Login, {})
  }));
}
render();