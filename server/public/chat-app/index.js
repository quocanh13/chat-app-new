import { StrictMode, createContext } from "react";
import { createRoot } from "react-dom/client";
import cookieParse from "../utils/cookie-parse.js";
import { getData } from "../utils/jwt.js";
import ChatApp from "./ChatApp.js";
import { getUser } from "../request/user.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { getRoomList } from "../request/room.js";
import { jsx as _jsx } from "react/jsx-runtime";
function render() {
  const root = createRoot(document.querySelector("#root"));
  root.render(/*#__PURE__*/_jsx(ChatApp, {}));
}
render();