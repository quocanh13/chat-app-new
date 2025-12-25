import { createPopUp } from "../utils/popUp/popUp.js";
import { getData } from "../utils/jwt.js";
import cookieParser from "../utils/cookie-parse.js";
import { postAvatar } from "./file.js";
import { ServerResponse} from "../utils/types.mjs";
import { isImage } from "../utils/checkFileType.js";
import {displayMessage, redirect} from "../utils/responseHandler.js"

/**
 * @param {Event} ev 
 */
export async function getMyInformation(){
    const cookie = cookieParser(document.cookie);
    const token = cookie.token;
    const {username} = getData(token);
    const resData = await getUserInformation(username);
    redirect(resData);
    displayMessage(resData);
    if(resData.type == "OK") {
        window.userInformation = resData.data;
        if(window.userInformation.avatar != null) {
            document.querySelector(".user-information-image").src = "/file/" + window.userInformation.avatar + "/view";
        }
    }
}

/**
 * @param {string} username 
 * @param {string} name 
 */
export function displayMyInformationCard(){
    let avatar = "../image/user-userInformation.png"
    if(window.userInformation.avatar != null) {
        avatar = "/file/" + window.userInformation.avatar + "/view" 
    }
    const html =
    `
        <div class="user-information-card flex-center shadow">
            <form action="">
                <input type="file" name="avatar" id="">
            </form>
            <div class="flex-center">
                <img src="${avatar}" alt="">
                <div>
                    <p><b>Username</b> : ${window.userInformation.username}</p>
                    <p><b>Name</b> : ${window.userInformation.name}</p>
                </div>
                <button>Ok</button>
            </div>
        </div>
    `
    /**@type {File} */
    let uploadAvatar;
    document.querySelector(".user-frame").insertAdjacentHTML("beforebegin", html); 
    document.querySelector(".user-information-card button").addEventListener("click", (ev)=>{
        updateAvatarEvent(uploadAvatar);
        document.querySelector(".user-information-card").remove();
    });
    document.querySelector(".user-information-card img").addEventListener("click", avatarClickEvent);
    document.querySelector(".user-information-card input").addEventListener("change", ()=>{
        uploadAvatar = chosenAvatar();   
    });
}

/**
 * @param {Object} param0 
 * @param {string} param0.username  
 * @returns {Promise<ServerResponse>}
*/
export async function getUserInformation(username) {
    const res = await fetch(
        "/user/" + username,
        {
            method : "GET"
        }
    );
    return await res.json();
}

function avatarClickEvent() {
    const input = document.querySelector(".user-information-card > form > input");
    input.click();
}

/**
 * @returns {FormData | undefined}
 */
function chosenAvatar() {
    const input = document.querySelector(".user-information-card form");
    const formData = new FormData(input);
    formData.append("type", "AVATAR");
    const avatar = formData.get("avatar");
    if(avatar.name == "") {
        document.querySelector(".user-information-card img").src = "../image/user-userInformation.png"
        return undefined;
    }
    if(isImage(avatar.type)) {
        const imgURL = URL.createObjectURL(avatar);
        document.querySelector(".user-information-card img").src = imgURL;
        return formData;
    } else {
        createPopUp({message : "Avatar phải là file ảnh", error : true});
        return undefined;
    }
}

/**
 * @param {File} avatar 
 */
async function updateAvatarEvent(avatar) {
    if(avatar instanceof FormData) {
        /**@type {ServerResponse} */
        const resData = await postAvatar(avatar);
        redirect(resData);
        displayMessage(resData);
        if(resData.type == "OK") {
            window.userInformation.avatar = resData.data.avatar
            document.querySelector(".user-information-image").src = `/file/${resData.data.avatar}/view`;
        }
    }
}