import { getMyInformation, displayMyInformationCard } from "./userInformation.js";
import { getRoomList, displayCurrentRoomInformationEvent, displayRoomList, newRoomEvent, searchRoomChange } from "./room-list.mjs";
import { attachFileClick, getMoreMessageEvent, sendMessageEvent, textAreaTypeEvent } from "./chat.js";

await getMyInformation();
await displayRoomList();

document.querySelector(".user-frame .user-information-image").addEventListener("click", displayMyInformationCard);
document.querySelector(".get-room-information").addEventListener("click", displayCurrentRoomInformationEvent);
document.querySelector(".search-bar > input").addEventListener("change", searchRoomChange);
document.querySelector(".new-room").addEventListener("click", newRoomEvent);
document.querySelector(".send-bar button").addEventListener("click", sendMessageEvent);
document.querySelector(".send-bar .attach-file-img").addEventListener("click", attachFileClick);
document.querySelector(".message-frame").addEventListener("scroll", getMoreMessageEvent);
document.querySelector(".send-bar textarea").addEventListener("input", textAreaTypeEvent);

// function test(){
//     const cookie = cookieParser(document.cookie);
//     const token = cookie.token;
//     console.log(getData(token));
//     setTimeout(()=>{
//         test();
//     }, 5000);
// }

// test();
