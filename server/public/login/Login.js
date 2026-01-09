import { login } from "../request/login.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Login() {
  async function onSubmitForm() {
    const formData = new FormData(document.querySelector(".login-form"));
    const resData = await login({
      username: formData.get("username"),
      password: formData.get("password")
    });
    if (resData.type != "OK") {
      createPopUp({
        message: resData.message
      });
    }
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "login-container",
    children: [/*#__PURE__*/_jsx("h3", {
      children: "\u0110\u0103ng Nh\u1EADp"
    }), /*#__PURE__*/_jsxs("form", {
      className: "login-form",
      action: "",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "form-group",
        children: [/*#__PURE__*/_jsx("img", {
          src: "../images/username-icon.png",
          alt: ""
        }), /*#__PURE__*/_jsx("input", {
          type: "text",
          name: "username",
          id: "username",
          placeholder: "Nh\u1EADp t\xE0i kho\u1EA3n..."
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "form-group",
        children: [/*#__PURE__*/_jsx("img", {
          src: "../images/password-icon.png",
          alt: ""
        }), /*#__PURE__*/_jsx("input", {
          type: "password",
          id: "password",
          name: "password",
          placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u..."
        })]
      }), /*#__PURE__*/_jsx("button", {
        type: "button",
        className: "btn-login",
        onClick: onSubmitForm,
        children: "\u0110\u0103ng nh\u1EADp"
      }), /*#__PURE__*/_jsxs("p", {
        children: ["N\u1EBFu b\u1EA1n ch\u01B0a c\xF3 t\xE0i kho\u1EA3n, ", /*#__PURE__*/_jsx("a", {
          href: "/register/register.html",
          children: "nh\u1EA5n v\xE0o \u0111\xE2y"
        }), " \u0111\u1EC3 \u0111\u0103ng k\xFD"]
      })]
    })]
  });
}