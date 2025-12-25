import { createPopUp } from "../utils/popUp/popUp.js";
import { FileInformation, ServerResponse } from "../utils/types.mjs";
import { redirect } from "../utils/responseHandler.js";

/**
 * @param {FormData} formData
 * @returns {Promise<ServerResponse>}
 */
export async function postAvatar(formData) {
    const res = await fetch(
        `/user/${window.userInformation.username}/avatar`,
        {
            method : "POST",
            body : formData
        }
    );
    /**@type {ServerResponse} */
    const resData = await res.json();
    return resData;
}

/**
 * 
 * @param {FormData} formData 
 * @param {"MESSAGE"} type 
 * @returns {Promise<ServerResponse>}
 */
export async function postFile(formData, type, roomID) {
    formData.append("type", type);
    formData.append("roomID", roomID);
    const res = await fetch(
        "/file",
        {
            method : "POST",
            body : formData
        }
    )
    return await res.json();
}

/**
 * 
 * @param {number} id 
 * @returns {Promise<FileInformation | null>}
 */
export async function getFileInformation(id, data) {
    const res = await fetch(
        "/file/" + id,
        {
            method : "GET",
        }
    );
    /**@type {ServerResponse} */
    const resData = await res.json();
    redirect(resData);
    createPopUp(resData);
    if(resData.type == "OK") {
        return resData.data;
    } else {
        return null;
    }
}