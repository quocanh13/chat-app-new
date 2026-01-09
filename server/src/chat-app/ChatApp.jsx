import { useState, useEffect, createContext } from "react";
import { Room } from "../utils/types.js";
import ChatRoom from "./ChatRoom.js";
import Sidebar from "./Sidebar.js";
import { getRoomInformation, getRoomList } from "../request/room.js";
import { createPopUp } from "../utils/popUp/popUp.js";
import { getUser } from "../request/user.js";
import { getData } from "../utils/jwt.js";
import cookieParser from "../utils/cookie-parse.js";

export const ChatAppContext = createContext(null)

export default function ChatApp() {
    const [user, setUser] = useState(null)
    const [roomList, setRoomList] = useState(null)
    const [curRoom, setCurRoom] = useState(null)
    const [reloadRoomList, setReloadRoomList] = useState(false)
    const [reloadCurRoom, setReloadCurRoom] = useState(false)
    useEffect(()=>{
        getUser(getData(cookieParser(document.cookie).token).username).then(res=>{
            if(res.type == "OK") {
                setUser(res.data)
                getRoomList(res.data.username).then(res=>{
                    if(res.type == "OK") {
                        setRoomList(res.data)
                        if(res.data.length > 0) {
                            setCurRoom(res.data[0])
                        }
                    } else {
                        createPopUp(res)
                    }
                })
            } else {
                createPopUp(res)
            }
        })
    },[reloadRoomList])

    useEffect(()=>{
        if(curRoom != null) {
            getRoomInformation(curRoom.roomID).then(res => {
                if(res.type == "OK") {
                    setCurRoom(res.data)
                }
                createPopUp()
            })
        }
    }, [reloadCurRoom])

    /**@type {Room[]} */
    const _roomList = [
        {
            roomName : "Room 1", 
            roomID : 1, 
            host : "quocanh123", 
            memberList : [
                {username : "quocanh", name : "Nguyen Quoc Anh"},
                {username : "quocanh1", name : "Nguyen Quoc Anh"},
                {username : "quocanh2", name : "Nguyen Quoc Anh"},
                {username : "quocanh3", name : "Nguyen Quoc Anh"},
                {username : "quocanh4", name : "Nguyen Quoc Anh"},
                {username : "quocanh5", name : "Nguyen Quoc Anh"},
                {username : "quocanh6", name : "Nguyen Quoc Anh"},
                {username : "quocanh7", name : "Nguyen Quoc Anh"}
            ],
        },
        {roomName : "Room 2", roomID : 2},
        {roomName : "Room 3", roomID : 3},
        {roomName : "Room 4", roomID : 4},
        {roomName : "Room 5", roomID : 5},
        {roomName : "Room 6", roomID : 6},
        {roomName : "Room 7", roomID : 7},
        {roomName : "Room 8", roomID : 8},
        {roomName : "Room 9", roomID : 9},
        {roomName : "Room 10", roomID : 10},
        {roomName : "Room 11", roomID : 11},
        {roomName : "Room 12", roomID : 12},
    ]
    
    if(user != null && roomList != null) {
        return(
            <ChatAppContext.Provider value={
                    {user, setUser, roomList, setRoomList, setReloadRoomList, curRoom, setCurRoom, setReloadCurRoom}
                }>
                <div className="chatapp-container"> 
                    <Sidebar roomList={roomList}/>
                    <ChatRoom curRoom={curRoom}/>
                </div>
            </ChatAppContext.Provider>
        )
    } else {
        return <div></div>
    }
}

