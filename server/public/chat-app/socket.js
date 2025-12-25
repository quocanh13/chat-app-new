import { FileInformation, ReceivingMessage, SendingMessage } from "../utils/types.mjs";
import { addAMessageCard, displayLatestMessage } from "./chat.js";
const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

socket.onopen = (/** @type {Event}*/ ev)=>{
    console.log("Connected To Server");
}

socket.onmessage = (/** @type {MessageEvent}*/ ev)=>{
    /**@type {ReceivingMessage} */
    const receivingMessage = JSON.parse(ev.data);
    addAMessageCard(receivingMessage, "beforeend", true);
    displayLatestMessage({roomID : receivingMessage.roomID, latestMessage : receivingMessage});
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