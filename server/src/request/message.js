import { FileInformation, ReceivingMessage, SendingMessage, ServerResponse } from "../utils/types.js";
const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

socket.onopen = (/** @type {Event}*/ ev)=>{
    console.log("Connected To Server");
}

export function addOnMessageSocket(setMesageList, setOffset, roomID) {
    if(roomID != null && roomID != undefined) {
        socket.onmessage = (/** @type {MessageEvent}*/ ev)=>{
            /**@type {ReceivingMessage} */
            const receivingMessage = JSON.parse(ev.data);
            if(roomID == receivingMessage.roomID) {
                setMesageList(pre => [receivingMessage, ...pre])
                setOffset(pre => pre + 1)
            }
        }
    }
}

/**
 * @param {CloseEvent} ev 
 */
socket.onclose = (ev)=>{
    console.log(ev.reason);
}

/**
 * @param {SendingMessage} sendingMessage 
 */
export function sendMessage(sendingMessage) {
    socket.send(JSON.stringify(sendingMessage));
}

/**
 * 
 * @param {number} roomID 
 * @param {number} offset 
 * @param {number} limit
 * @return {Promise<ServerResponse>} 
 */
export async function getMessageList(roomID, offset, limit) {
    const res = await fetch(
        `/room/${roomID}/message?offset=${offset}&limit=${limit}`
    )

    /**@type {ServerResponse} */
    const resData = await res.json()
    if(resData.type == "REDIRECT") {
        window.location.href = resData.redirectURL
    }
    return resData
}

/**
 * 
 * @param {FormData} formData 
 * @param {"MESSAGE" | "AVATAR"} type 
 * @returns {Promise<ServerResponse>}
 */
export async function sendFile(formData, type, roomID) {
    formData.append("type", type);
    if(roomID != undefined) formData.append("roomID", roomID);
    const res = await fetch(
        "/file",
        {
            method : "POST",
            body : formData
        }
    )

    /**@type {ServerResponse} */
    const resData = await res.json()
    if(resData.type == "REDIRECT") {
        window.location.href = resData.redirectURL
    }
    return resData
}

export async function getFileInformation(fileID) {
    const res = await fetch(
        `/file/${fileID}`,
        {
            method : "GET"
        }
    )

    /**@type {ServerResponse} */
    const resData = await res.json()
    if(resData.type == "REDIRECT") {
        window.location.href = resData.redirectURL
    }
    return resData
}