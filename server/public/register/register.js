import { register } from "../request/register.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Register() {
  async function onSubmitForm() {
    const formData = new FormData(document.querySelector(".register-form"));
    const data = {
      username: formData.get("username"),
      password: formData.get("password"),
      name: formData.get("name")
    };
    console.log(data);
    const resData = await register(data);
    if (resData.type != "OK") {
      createPopUp(resData);
    }
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "register-container",
    children: [/*#__PURE__*/_jsx("h3", {
      children: "\u0110\u0103ng K\xFD T\xE0i Kho\u1EA3n"
    }), /*#__PURE__*/_jsxs("form", {
      className: "register-form",
      action: "",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "form-group",
        children: [/*#__PURE__*/_jsx("img", {
          src: "../images/username-icon.png",
          alt: "user"
        }), /*#__PURE__*/_jsx("input", {
          type: "text",
          name: "username",
          id: "username",
          placeholder: "Nh\u1EADp t\xE0i kho\u1EA3n...",
          required: true
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "form-group",
        children: [/*#__PURE__*/_jsx("img", {
          src: "../images/password-icon.png",
          alt: "lock"
        }), /*#__PURE__*/_jsx("input", {
          type: "password",
          id: "password",
          name: "password",
          placeholder: "Nh\u1EADp m\u1EADt kh\u1EA9u...",
          required: true
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "form-group",
        children: [/*#__PURE__*/_jsx("img", {
          src: "../images/password-icon.png",
          alt: "name"
        }), /*#__PURE__*/_jsx("input", {
          type: "text",
          id: "name",
          placeholder: "Nh\u1EADp t\xEAn c\u1EE7a b\u1EA1n...",
          name: "name",
          required: true
        })]
      }), /*#__PURE__*/_jsx("button", {
        type: "button",
        className: "btn-register",
        onClick: onSubmitForm,
        children: "\u0110\u0103ng k\xFD"
      }), /*#__PURE__*/_jsxs("p", {
        children: ["N\u1EBFu b\u1EA1n \u0111\xE3 c\xF3 t\xE0i kho\u1EA3n, ", /*#__PURE__*/_jsx("a", {
          href: "/login/login.html",
          children: "nh\u1EA5n v\xE0o \u0111\xE2y"
        }), " \u0111\u1EC3 \u0111\u0103ng nh\u1EADp"]
      })]
    })]
  });
}