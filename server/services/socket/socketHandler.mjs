import {server, userSockets} from "./sockerServer.mjs";
import { SendingMessage, ReceivingMessage } from "../../public/utils/types.mjs";
import {createMessage, getMessageByID} from "../../services/message/message.mjs"
import { isInRoom } from "../room/room.mjs";

/**
 * @param {import("socket.io").Socket} ws 
 */
export default function addEventHandler(ws) {
    ws.on("message:send", onSendMessage.bind(null, ws))
    ws.on("room:add-new-room", onAddNewRoom.bind(null, ws))
}

/**
 * @param {import("socket.io").Socket} ws 
 * @param {object} data 
 */
async function onSendMessage(ws, data) {
    /**@type {SendingMessage} */
    const sendingMessage = data
    sendingMessage.username = ws.username;
    console.log(sendingMessage)
    const messageID = await createMessage(sendingMessage);
    
    if(typeof messageID == "number") {
        /**@type {ReceivingMessage} */
        const receivingMessage = await getMessageByID(messageID);
        server.to(receivingMessage.roomID.toString()).emit("message:receive", receivingMessage)
    }
}

/**
 * @param {import("socket.io").Socket} ws 
 * @param {number} roomID 
 */
async function onAddNewRoom(ws, roomID) {
    if(await isInRoom({username : ws.username, roomID})) {
        ws.join(roomID.toString());
    }
}

/**
 * @param {number} roomID 
 * @param {string} username 
 */
export function addMember(roomID, username) {
    userSockets.get(username).join(roomID.toString())
    server.to(userSockets.get(username).id).emit("room:added", roomID)
    server.to(roomID.toString()).emit("room:new-member", {username, roomID})
}

/**
 * @param {number} roomID 
 * @param {string} username 
 */
export function leaveRoom(roomID, username) {
    const socket = userSockets.get(username)
    socket.leave(roomID.toString())
    server.to(roomID.toString()).emit("room:member-leave", {roomID, username})
}

/**
 * @param {number} roomID 
 * @param {string} username 
 */
export function deleteMember(roomID, username) {
    const socket = userSockets.get(username)
    socket.leave(roomID.toString())
    server.to(socket.id).emit("room:deleted-member", roomID)
}

/**
 * @param {number} roomID 
 */
export function deleteAllMember(roomID) {
    server.to(roomID.toString()).emit("room:deleted-member", roomID)
    server.in(roomID.toString()).socketsLeave(roomID.toString())
}

