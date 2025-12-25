import { redirect } from "../utils/responseHandler.js";
import { currentRoom } from "./room-list.mjs";
import { ServerResponse } from "../utils/types.mjs";
import { createPopUp } from "../utils/popUp/popUp.js";
import { getUserInformation } from "./userInformation.js";

/**
 * @param {Object} param0 
 * @param {string} param0.username 
 * @param {number} param0.roomID 
 * @param {Event} param0.ev 
 * @returns {Promise<Response>}
 */
export async function addMember({username, roomID, ev}) {
    return await fetch(
        "/room/" + roomID + "/member",
        {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({memberUsername : username})
        }
    );
}

export async function addMemberEvent() {
    const form = document.querySelector(".add-member");
    const formData = new FormData(form);
    const username = formData.get("member-username");
    
    const res = await addMember({username, roomID : currentRoom.roomID});
    /**@type {ServerResponse} */
    const resData = await res.json();
    redirect(resData);
    createPopUp(resData);
    if(resData.type == "OK") {
        const _resData = await getUserInformation(username);
        const userInfo = _resData.data;
        let removeButton = false;
        if(currentRoom.host == window.userInformation.username) removeButton = true; 
        addAMemberCard({
            username : userInfo.username, 
            name : userInfo.name, 
            removeButton
        });
    }
    form.reset();
}

/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {number} param0.roomID
 * @returns {Promise<ServerResponse>}
 */
async function removeMemberEvent({username, roomID}) {
    const res = await fetch(
        "/room/" + roomID + "/member/" + username,
        {
            method : "DELETE"
        }
    );
    /**@type {ServerResponse} */
    const resData = await res.json();
    redirect(resData);
    return resData;
}

/**
 * 
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {string} param0.name
 * @param {boolean} param0.removeButton
 */
export function addAMemberCard({username, name, removeButton}) {
    const memberList = document.querySelector(".member-list");
    let removeButtonHTML = ``;
    if(removeButton) removeButtonHTML = '<button>Xóa</button>';
    const memberCardHTML = 
    `
        <div class="member-card username-${username}">
            <div class="member-information ">
                <p><b>Username</b> : ${username}</p>
                <p><b>Name</b> : ${name}</p>
            </div>
            ${removeButtonHTML}
        </div>
    `
    memberList.insertAdjacentHTML("beforeend", memberCardHTML);
    const memberCard = document.querySelector(`.member-card.username-${username}`);
    if(removeButton) {
        const memberCardButton = document.querySelector(`.member-card.username-${username} button`);
        memberCardButton.addEventListener("click", async ()=>{
            const resData = await removeMemberEvent({username, roomID : currentRoom.roomID});
            if(resData.displayMessage) {
                createPopUp(resData);
            }
            if(resData.type == "OK") memberCard.remove();
        });
    }
}        

export function addListOfMemberCard() {
    if(currentRoom.host == window.userInformation.username) {
        addAMemberCard({
            username : currentRoom.memberList[0].username, 
            name : currentRoom.memberList[0].name, 
            removeButton : false
        });
        for(let i = 1; i < currentRoom.memberList.length; i++) {
            addAMemberCard({
                username : currentRoom.memberList[i].username, 
                name : currentRoom.memberList[i].name, 
                removeButton : true
            });
        }    
    } else {
        for(let i = 0; i < currentRoom.memberList.length; i++) {
            addAMemberCard({
                username : currentRoom.memberList[i].username, 
                name : currentRoom.memberList[i].name
            });
        }  
    }
}