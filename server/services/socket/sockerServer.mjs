import cookieParser from "../../public/utils/cookie-parse.js"
import { verify } from "../../utils/jwt.mjs";
import { getRoomList } from "../room/room.mjs";
import addEventHandler from "./socketHandler.mjs";
import {Server} from "socket.io"
import httpServer from "../../server.mjs"

const server = new Server(httpServer)
const userSockets = new Map();

server.on("connection", async (ws)=>{
    const token = cookieParser(ws.request.headers.cookie).token;
    const payload = verify(token);
    if(payload == "ERROR") {
        ws.disconnect(true)
    } else {
        ws.username = payload.username;
        ws.name = payload.name;
        userSockets.set(ws.username, ws)
        const roomList = await getRoomList({username : ws.username});
        for(const i of roomList) {
            ws.join(i.roomID.toString());
        }
    }

    ws.on("disconnect", (reason)=>{
        userSockets.delete(ws.username);
    })

    addEventHandler(ws)
});


export {server, userSockets};