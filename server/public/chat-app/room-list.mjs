import { createPopUp } from "../utils/popUp/popUp.js";
import { addListOfMemberCard, addMemberEvent } from "./member.js";
import { redirect } from "../utils/responseHandler.js";
import {Room} from "../utils/types.mjs"
import { ServerResponse } from "../utils/types.mjs";
import { displayLatestMessage, displayMessageList, getMessageList } from "./chat.js";


/**@type {Room} */
export let currentRoom = {
    roomID : 0,
    roomName : "",
    host : "",
    token : "",
    memberList : [],
    offset : 0,
    messageList : [],
    latestMessage : {
        message : "",
        username : "",
        name : ""
    }
};

export async function newRoomEvent(ev) {
    const html = 
    `
        <div class="create-room flex-center shadow">
            <form action="" class="flex-center">
                <h2>Tạo Phòng</h2>
                <input type="text" placeholder="Tên Phòng" name="roomName">
                <button type="button">Ok</button>
            </form>
        </div>
    `
    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
    document.querySelector(".create-room button").addEventListener("click", (ev)=>{
        const form = document.querySelector(".create-room > form");
        const formData = new FormData(form);
        const roomName = formData.get("roomName");
        createRoom(roomName);
        document.querySelector(".create-room").remove();
    });
}

/**
 * @param {Object} param0 
 * @param {string} param0.roomID
 * @returns {Promise<Room | undefined>}
 */
async function getRoomInfo({roomID}) {
    return fetch(
        "/room/" + roomID,
        {
            method : "GET"
        }
    ).then(res => {
        return res.json();
    }).then((/**@type {ServerResponse}*/ resData) => {
        return resData.data;
    });
}

/**
 * @returns {Promise<number[] | undefined>}
 */
export async function getRoomList() {
    
    return fetch(
        "/user/" + window.userInformation.username + "/room",
        {
            method : "GET"
        }
    )
    .then((res)=>{
        return res.json();
    })
    .then((/**@type {ServerResponse}*/ resData)=>{
        redirect(resData);
        if(resData.type == "OK") {
            return resData.data;
        } else {
            if(resData.displayMessage) {
                createPopUp(resData);
            }
        }
    });
}

/**
 * @param {Room} roomInformation 
 */
function updateCurrentRoom(roomInformation) {
    if(currentRoom.roomID != 0) document.querySelector(`#room-id-${currentRoom.roomID}`).classList.remove("current-room-card");
    currentRoom = roomInformation;
    document.querySelector(`#room-id-${currentRoom.roomID}`).classList.add("current-room-card");
    displayMessageList(currentRoom.messageList, "afterbegin");
}

/**
 * @param {Object} param0 
 * @param {string} param0.roomName
 * @param {string} param0.roomID
 * @param {{message : string, username : string, name : string}} param0.latestMessage
 */
function displayRoomCard({roomName, roomID, latestMessage}) {
    const html = 
    `
        <div id="room-id-${roomID}" class="room-card">
            <p class="room-name" >${roomName}</p>
            <p class="latest-message"></p>
        </div>
    `
    document.querySelector(".room-list").insertAdjacentHTML("beforeend", html);
    document.querySelector(`#room-id-${roomID}`).addEventListener("click", ()=>{
        changeCurrenRoomEvent(roomID)
    });
    displayLatestMessage({roomID, latestMessage});
}

/**
 * @param {string} roomName 
 */
function createRoom(roomName){
    fetch(
        "/room",
        {
            method : "POST",
            body : JSON.stringify({roomName}),
            headers : {'Content-Type': 'application/json'}
        }
    ).then(res => {
        return res.json();
    }).then((/**@type {ServerResponse} */ resData) =>{
        redirect(resData);
        if(resData.displayMessage) {
            createPopUp(resData);
        }
        if(resData.type == "OK") {
            displayRoomCard({roomName, roomID : resData.data, latestMessage : {name : "Bạn", message : "Phòng mới được tạo"}});S
        }
    });
}

/**
 * @param {number} roomID
 */
async function changeCurrenRoomEvent(roomID) {
    const roomInformation = await getRoomInfo({roomID});
    roomInformation.messageList = await getMessageList({roomID, offset : 0, limit : 30});
    roomInformation.offset = roomInformation.messageList.length;
    updateCurrentRoom(roomInformation);
}

/**
 * @param {Event} ev 
 */
export function displayCurrentRoomInformationEvent(ev){
    const html = 
    `
    <div class="room-information-frame flex-center shadow">
            <div class="room-information-card">
                <h2>Thông Tin Phòng</h2>
                <p>Tên Phòng : ${currentRoom.roomName}</p>
                <form action="" class="add-member flex-center" onsubmit="return false;">
                    <input type="text" name="member-username" id="" placeholder="Nhập Username của thành viên bạn muốn thêm vào phòng">
                    <button type="button">Thêm</button>
                </form>
                <h2>Danh Sách Thành Viên</h2>
                <div class="member-list">
                </div>
            </div>
        </div>
    `

    document.querySelector("body").insertAdjacentHTML("afterbegin", html);
    document.querySelector(".room-information-card").addEventListener("click", (ev)=>{
        ev.stopPropagation();
    });
    document.querySelector(".room-information-frame").addEventListener("click", (ev)=>{
        document.querySelector(".room-information-frame").remove();
    });
    document.querySelector(".add-member button").addEventListener("click", async (ev)=>{
        addMemberEvent();
    })
    addListOfMemberCard();
}

export async function displayRoomList() {
    const roomList = await getRoomList();
    let firstRoom;
    if(roomList.length != 0) {
        firstRoom = await getRoomInfo(roomList[0]);
    }
    for(let i = 0; i < roomList.length; i++) {
        const roomInfo = await getRoomInfo(roomList[i]);
        displayRoomCard(roomInfo);
    }
    if(firstRoom != undefined) {
        changeCurrenRoomEvent(firstRoom.roomID);    
    }
}

/**
 * @param {Event} ev 
 */
export function searchRoomChange(ev) {
    const searchText = ev.target.value;
    const roomList = document.querySelectorAll(".room-card");
    roomList.forEach((room, key, parent)=>{
        if(room.children[0].textContent.includes(searchText)){
            room.style.display = "block";
        } else {
            room.style.display = "none";
        }
    });
}