import { ServerResponse } from "../utils/types.js";

/**
 * 
 * @param {number} roomID 
 * @param {number} offset 
 * @param {number} limit
 * @return {Promise<ServerResponse>} 
 */
export async function getMessageList(roomID, offset, limit) {
  const res = await fetch(`/room/${roomID}/message?offset=${offset}&limit=${limit}`);

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}

/**
 * 
 * @param {FormData} formData 
 * @param {"MESSAGE" | "AVATAR"} type 
 * @returns {Promise<ServerResponse>}
 */
export async function sendFile(formData, type, roomID) {
  formData.append("type", type);
  if (roomID != undefined) formData.append("roomID", roomID);
  const res = await fetch("/file", {
    method: "POST",
    body: formData
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}
export async function getFileInformation(fileID) {
  const res = await fetch(`/file/${fileID}`, {
    method: "GET"
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}