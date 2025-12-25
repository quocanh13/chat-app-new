import {WebSocket} from "ws";
import { ReceivingMessage } from "../../public/utils/types.mjs";

class RoomSocket{
    /**@type {number} */
    roomID;
    /**@type {Map<string, WebSocket>} */
    socketList;

    constructor(roomID) {
        this.roomID = roomID;
        this.socketList = new Map();
    }

    /**
     * @param {WebSocket} ws 
     */
    addSocket(ws) {
        if(ws instanceof WebSocket) {
            this.socketList.set(ws.username, ws);
        } else {
            console.log("ws is not a WebSocket instance");
        }
    }

    /**
     * @param {ReceivingMessage} message 
     */
    broadCast(message){
        for(const ws of this.socketList.values()) {
            ws.send(JSON.stringify(message), (err)=>{
                if(err) console.log(err);
            })
        }
    }
    
    /**
     * @param {string} username 
     * @returns {boolean}
     */
    removeSocket(username) {
        return this.socketList.delete(username)
    }
}

export class RoomManagement{
    /**@type {Map<number, RoomSocket>} */
    #roomList;

    constructor() {
        this.#roomList = new Map();
    }

    /**
     * @param {number} roomID 
     * @returns {RoomSocket}
     */
    getRoom(roomID) {
        let room = this.#roomList.get(roomID);
        if(room == undefined) {
            room = new RoomSocket(roomID);
            this.#roomList.set(roomID, room);
        }
        return room;
    }
}