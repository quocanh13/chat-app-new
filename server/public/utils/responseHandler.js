import { createPopUp } from "./popUp/popUp.js";
import { ServerResponse } from "./types.mjs";

/**
 * 
 * @param {ServerResponse} resData 
 */
export function redirect(resData) {
  if (resData.type == "REDIRECT") {
    window.location.href = resData.redirectURL;
  }
}

/**
 * @param {ServerResponse} resData 
 */
export function displayMessage(resData) {
  if (resData.displayMessage) {
    createPopUp(resData);
  }
}