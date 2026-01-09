import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Register from "./Register.js";
import { jsx as _jsx } from "react/jsx-runtime";
function render() {
  const root = createRoot(document.querySelector("#root"));
  root.render(/*#__PURE__*/_jsx(StrictMode, {
    children: /*#__PURE__*/_jsx(Register, {})
  }));
}
render();