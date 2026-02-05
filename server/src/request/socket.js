import { FileInformation, ReceivingMessage, SendingMessage, ServerResponse } from "../utils/types.js";
import { io } from "socket.io-client";

const socket = io();

socket.onAny((event, ...args) => {
  console.log(event);
});
socket.on("connect", (socket)=>{
    console.log("Connected To Server")
})
socket.on("disconnect", (reason) => {
    console.log("Socket disconnected", reason);
});

export function addOnMessageReceive(onMessageReceive){
    socket.on("message:receive", onMessageReceive)
}

export function removeOnMessageReceive(onMessageReceive){
    socket.off("message:receive", onMessageReceive)
}

/**
 * @param {SendingMessage} sendingMessage 
 */
export function sendMessage(sendingMessage) {
    socket.emit("message:send", sendingMessage)
}

export function addNewRoom(roomID) {
    socket.emit("room:add-new-room", roomID)
}

export function addOnAdded(onAddMember) {
    socket.on("room:added", onAddMember)
}

export function addOnMemberLeave(onMemberLeave) {
    socket.on("room:member-leave", onMemberLeave)
}

export function addOnNewMember(onNewMember) {
    socket.on("room:new-member", onNewMember)
}

export function addOnDeletedMember(onDeletedMember) {
    socket.on("room:deleted-member", onDeletedMember)
}