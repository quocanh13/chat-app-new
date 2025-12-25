import { WebSocketServer } from "ws";
import cookieParser from "../../public/utils/cookie-parse.js"
import { verify } from "../../utils/jwt.mjs";
import { getRoomList } from "../room/room.mjs";
import { RoomManagement } from "./roomSocket.mjs";
import { ReceivingMessage, SendingMessage } from "../../public/utils/types.mjs";
import addEventHandler from "./socketHandler.mjs";

const server = new WebSocketServer({port : 3000});
export const roomSocketList = new RoomManagement();

server.on("connection", async (ws, req)=>{
    const token = cookieParser(req.headers.cookie).token;
    const paypload = verify(token);
    if(paypload == "ERROR") {
        ws.close(1002, "Token đã hết hạn hoặc không đúng");
    } else {
        ws.username = paypload.username;
        ws.name = paypload.name;
        const roomList = await getRoomList(ws);
        for(const i of roomList) {
            roomSocketList.getRoom(i.roomID).addSocket(ws);
        }
        addEventHandler(ws);
    }

});


export default server;