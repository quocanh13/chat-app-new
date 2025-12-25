import { redirect } from "../utils/responseHandler.js";
import { ServerResponse } from "../utils/types.mjs";
import { createPopUp } from "../utils/popUp/popUp.js";

const form = document.querySelector("form");
const formButton = document.querySelector(".login-button");

formButton.addEventListener("click", (ev)=>{
    const formData = new FormData(form);
    const username = formData.get("username");
    const password = formData.get("password");

    fetch( 
        "/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({username, password}),
        }
    ).then(
        (res)=>{
            return res.json();
        }
    ).then((/**@type {ServerResponse}*/ resData) => {
        redirect(resData);
        if(resData.displayMessage) {
            createPopUp(resData);
        }
    });
});

