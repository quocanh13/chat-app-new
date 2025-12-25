import { createPopUp } from "../utils/popUp/popUp.js";
import { redirect } from "../utils/responseHandler.js";
import { ServerResponse } from "../utils/types.mjs";

const form = document.querySelector("form");
const formButton = document.querySelector(".register-button");

formButton.addEventListener("click", (ev)=>{
    const formData = new FormData(form);
    const username = formData.get("username");
    const password = formData.get("password");
    const name = formData.get("name");
    fetch( 
        "/user",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body : JSON.stringify({username, password, name})
        }
    ).then((res)=>{
        return res.json();
    }).then((/**@type {ServerResponse}*/ resData)=>{
        redirect(resData);
        if(resData.displayMessage) {
            createPopUp(resData);
        }
    })
});

