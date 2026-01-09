import { ServerResponse } from "../utils/types.js";

/**
 * 
 * @param {string} username 
 * @returns {Promise<ServerResponse>}
 */
export async function getUser(username) {
  const res = await fetch(`/user/${username}`, {
    method: "GET"
  });
  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") window.location.href = resData.redirectURL;
  return resData;
}
export async function updateAvatar(formData, username) {
  formData.append("type", "AVATAR");
  formData.append("useranme", username);
  const res = await fetch(`/user/${username}/avatar`, {
    body: formData,
    method: "POST"
  });
  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") window.location.href = resData.redirectURL;
  return resData;
}
export async function updateUserInformation(username, password, name) {
  const body = JSON.stringify({
    password,
    name
  });
  const res = await fetch(`/user/${username}`, {
    body,
    method: "PUT",
    headers: {
      "content-type": "application/json"
    }
  });
  /**@type {ServerResponse} */
  const resData = await res.json();
  if (resData.type == "REDIRECT") window.location.href = resData.redirectURL;
  return resData;
}