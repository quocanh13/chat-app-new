import { ServerResponse } from "../utils/types.js";
/**
 * @param {Object} param0 
 * @param {string} param0.username 
 * @param {string} param0.password  
 * @returns {Promise<ServerResponse>}
 */
export async function login({
  username,
  password
}) {
  const res = await fetch("/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password
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