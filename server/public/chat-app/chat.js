import { FileInformation, ReceivingMessage } from "../utils/types.mjs";
import { currentRoom } from "./room-list.mjs";
import { sendMessage } from "./socket.js";
import { ServerResponse } from "../utils/types.mjs";
import { redirect } from "../utils/responseHandler.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { getFileInformation, postFile } from "./file.js";

/**@type {boolean} */
let isLoadingMessage = false;

/**
 * @param {Object} param0 
 * @param {number} param0.roomID 
 * @param {number} param0.offset 
 * @param {number} param0.limit 
 * @returns {Promise<ReceivingMessage[]>}
 */
export async function getMessageList({roomID, offset, limit}) {
    if(offset == undefined || offset < 0) offset = 0;
    if(limit == undefined) limit = 10;
    const res = await fetch(
        "/room/" + roomID + `/message?offset=${offset}&limit=${limit}`,
        {
            method : "GET"
        }
    );
    /**@type {ServerResponse} */
    const resData = await res.json();
    redirect(resData);
    if(resData.type == "OK") {
        return resData.data;
    } else {
        if(resData.displayMessage) {
            createPopUp(resData);
        }
        return [];
    }
}
/**
 * @param {FormData} formData
 * @param {Promise<null | number>}
 */
export async function sendFile(formData) {
    if(formData.get("attach").size != 0) {
        console.log(formData.get("attach"));
        const resData = await postFile(formData, "MESSAGE", currentRoom.roomID);
        redirect(resData);        
        if(resData.type == "OK") {
            return resData.data.fileID;
        } else {
            return null;
        }
    } else return null;
}

/**
 * @param {Event} ev 
 */
export async function sendMessageEvent(ev) {
    const form = document.querySelector(".send-bar");
    const formData = new FormData(form);
    const message = formData.get("message");
    const fileID = await sendFile(formData);
    if(fileID != null) {
        sendMessage({
            roomID : currentRoom.roomID,
            fileID
        });
        document.querySelector(".current-attach-file-card").remove();
        document.querySelector(".send-bar input").value = "";
    } else if(message != "") {
        sendMessage({
            message,
            roomID : currentRoom.roomID
        });
        form.reset();
    }
}

/**
 * @param {ReceivingMessage} receivingMessage 
 * @param {"afterbegin" | "afterend" | "beforeend" | "beforebegin"} position 
 * @param {boolean} move 
 */
export async function addAMessageCard(receivingMessage, position, move = false) {
    let messageContentHTML = 
    `
        <p>${receivingMessage.message}</p>
    `;
    if(receivingMessage.fileID != null) {
        /**@type {FileInformation} */
        let fileInformation = await getFileInformation(receivingMessage.fileID);
        if(fileInformation == null) {
            fileInformation = {
                name : "Null",
                size : 0
            }
        }
        messageContentHTML = 
        `
            <a href="/file/${receivingMessage.fileID}/download">
                <div class="flex-center">
                    <img src="../image/file-icon.png" alt="">
                    <div>
                        <p class="file-name">${fileInformation.name}</p>
                        <p class="file-size">${convertFileSize(fileInformation.size)}</p>
                    </div>
                </div>
            </a>
        `
    } 
    let role = "receiver";
    if(receivingMessage.username == window.userInformation.username) role = "sender";
    const messageCardHTML = 
    `
        <div class="message-card ${role}">
            <div title="Username : ${receivingMessage.username} \nTime : ${receivingMessage.time}">
                <h3>${receivingMessage.name}</h3>
                ${messageContentHTML}
            </div>
        </div>
    `
    const messageFrame = document.querySelector(".message-frame");
    const preHeight = messageFrame.scrollHeight;
    messageFrame.insertAdjacentHTML(position, messageCardHTML);
    if(move) {
        const currentHeight = messageFrame.scrollHeight;
        messageFrame.scrollTop += currentHeight - preHeight;
    }
}

/**
 * @param {ReceivingMessage[]} list 
 * @param {"afterbegin" | "afterend" | "beforeend" | "beforebegin"} position 
 * @param {boolean} isAdd 
 */
export async function displayMessageList(list, position, isAdd = false) {
    const messageFrame = document.querySelector(".message-frame");
    if(!isAdd) messageFrame.innerHTML = "";
    for(const i of list) {
        await addAMessageCard(i, position);
    }
    messageFrame.scrollTop = messageFrame.scrollHeight;
}

/**
 * @param {Event} ev 
 */
export async function getMoreMessageEvent(ev) {
    if(!isLoadingMessage) {
        isLoadingMessage = true;
        const messageFrame = ev.target;
        if(messageFrame.scrollTop == 0) {
            const messageList = await getMessageList({
                roomID : currentRoom.roomID,
                offset : currentRoom.offset,
                limit : 10
            })
            currentRoom.offset += messageList.length;
            const preHeight = messageFrame.scrollHeight;
            document.querySelector(".top-bar").insertAdjacentHTML(
                "afterend", 
                `<img src="../image/loading-mesage-icon.png" class="loading-message-icon" alt=""></img>`
            );
            const loading = document.querySelector(".loading-message-icon");
            await displayMessageList(messageList, "afterbegin", true);
            setTimeout(()=>{loading.remove()}, 200);
            const currentHeight = messageFrame.scrollHeight;
            messageFrame.scrollTop = currentHeight - preHeight;
        }
        isLoadingMessage = false;
    }
}

/**
 * @param {Object} param0 
 * @param {string} param0.roomID
 * @param {{message : string, username : string, name : string}} param0.latestMessage
 */
export function displayLatestMessage({roomID, latestMessage}) {
    let message = latestMessage.message;
    const latestMessageCard = document.querySelector(`#room-id-${roomID} .latest-message`);
    if(message == "" || message == null) {
        message = "Tệp đính kèm";
    }
    latestMessageCard.textContent = `${latestMessage.name} : ${message}`;
}

export function attachFileClick() {
    const input = document.querySelector(".send-bar input");
    input.click();
    input.addEventListener("change", attachFileChange);
}

/**
 * @param {Event} ev 
 */
export function textAreaKeyEvent(ev) {
    if(ev.key == "enter") {
        
    }
}

function attachFileChange() {
    const formData = new FormData(document.querySelector(".send-bar"));
    const file = formData.get("attach");
    if(file != null) {
        displayCurrentFile(file.name, file.size);
    }
}

/**
 * 
 * @param {string} name 
 * @param {number} size 
 */
function displayCurrentFile(name, size) {
    const currentFileCard = document.querySelector(".current-attach-file-card");
    if(currentFileCard != null) currentFileCard.remove(); 
    const html = 
    `
        <div class="current-attach-file-card flex-center">
            <img src="../image/file-icon.png" class="file-icon" alt="">
            <div>
                <p class="file-name">${name}</p>
                <p class="file-size">${convertFileSize(size)}</p>
            </div>
            <img src="../image/remove-current-attachment-icon.png" class="remove-file-icon" alt="">
        </div>
    `
    document.querySelector(".message-frame").insertAdjacentHTML("afterend", html);
    document.querySelector(".current-attach-file-card .remove-file-icon").addEventListener("click", ()=>{
        const input = document.querySelector(".send-bar > input");
        input.value = "";
        document.querySelector(".current-attach-file-card").remove();
    });

}

/**
 * @param {number} size 
 * @returns {string}
 */
function convertFileSize(size) {
    if(size == null || size == undefined) return "0B";
    let unit = "B";
    if(size >= 10**3) {
        if(size >= 10**3 && size < 10**6 ) {
            size = Math.round(size / 10**2);
            unit = "KB";
        } else if(size >= 10**6 && size < 10**9) {
            size = Math.round(size / 10**5);
            unit = "MB"
        } else {
            size = Math.round(size / 10**8);
            unit = "GB";
        }
        size /= 10;
    }
    return `${size}${unit}`;
}