import WebSocket from "ws";
import { roomSocketList } from "./sockerServer.mjs";
import { SendingMessage, ReceivingMessage } from "../../public/utils/types.mjs";
import {createMessage, getMessageByID} from "../../services/message/message.mjs"

/**
 * @param {WebSocket.WebSocket} ws 
 */
export default function addEventHandler(ws) {
    ws.on("message", messageHanlder.bind(null, ws.username))
}

/**
 * @param {string} username
 * @param {WebSocket.RawData} data 
 * @param {boolean} isBinary 
 */
async function messageHanlder(username, data, isBinary) {
    /**@type {SendingMessage} */
    const sendingMessage = JSON.parse(data.toString())
    sendingMessage.username = username;

    const messageID = await createMessage(sendingMessage);
    
    if(typeof messageID == "number") {
        /**@type {ReceivingMessage} */
        const receivingMessage = await getMessageByID(messageID);
        receivingMessage.type = "MESSAGE";
        roomSocketList.getRoom(sendingMessage.roomID).broadCast(receivingMessage);
    }
}