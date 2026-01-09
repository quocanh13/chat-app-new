import { ServerResponse } from "../utils/types.js";

/**
 * @param {string} username
 * @returns {Promise<ServerResponse>}
 */
export async function getRoomList(username) {
  const res = await fetch(`/user/${username}/room`, {
    method: "GET"
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}

/**
 * @param {string} username
 * @returns {Promise<ServerResponse>}
 */
export async function postRoom(roomName) {
  const res = await fetch(`/room`, {
    method: "POST",
    body: JSON.stringify({
      roomName
    }),
    headers: {
      "content-type": "application/json"
    }
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}

/**
 * @param {number} roomID
 * @returns {Promise<ServerResponse>}
 */
export async function getMemberList(roomID) {
  const res = await fetch(`/room/${roomID}/member`, {
    method: "GET"
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}

/**
 * @param {number} roomID
 * @param {string} username 
 * @returns {Promise<ServerResponse>}
 */
export async function addMember(roomID, memberUsername) {
  const res = await fetch(`/room/${roomID}/member`, {
    method: "POST",
    body: JSON.stringify({
      memberUsername
    }),
    headers: {
      "content-type": "application/json"
    }
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}
export async function deleteMember(roomID, username) {
  const res = await fetch(`/room/${roomID}/member/${username}`, {
    method: "DELETE"
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}

/**
 * @param {number} roomID
 * @returns {Promise<ServerResponse>}
 */
export async function getRoomInformation(roomID) {
  const res = await fetch(`/room/${roomID}`, {
    method: "GET"
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}
export async function deleteRoom(roomID) {
  const res = await fetch(`/room/${roomID}`, {
    method: "DELETE"
  });

  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
  return resData;
}