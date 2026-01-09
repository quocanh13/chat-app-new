import {ServerResponse} from "../utils/types.js"
/**
 * @param {Object} param0 
 * @param {string} param0.username 
 * @param {string} param0.password  
 * @param {string} param0.name  
 * @returns {Promise<ServerResponse>}
 */
export async function register({username, password, name}) {
    const res = await fetch(
        "/user",
        {
            method : "POST",
            body : JSON.stringify({username, password, name}),
            headers : {
                "content-type" : "application/json"
            }
        }
    )
    /**@type {ServerResponse} */
    const resData = await res.json()
    if(resData.type == "REDIRECT") {
        window.location.href = resData.redirectURL
    }
    return resData
}