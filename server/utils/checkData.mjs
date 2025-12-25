const usernamePattern = /^[a-zA-Z0-9]+$/;
const passwordPattern = /^[a-zA-Z0-9]+$/;
const namePattern = /^[\p{L}\s]+$/u;
const roomNamePattern = /^[\p{L}\s0-9]+$/u;

/** 
 * @param {string} username 
 * @returns {boolean}
 */
export function checkUsername(username) {
    return usernamePattern.test(username);
}

/**
 * @param {string} password 
 * @returns {boolean}
 */
export function checkPassword(password) {
    return passwordPattern.test(password);
}

/**
 * @param {string} password 
 * @returns {boolean}
 */
export function checkName(name) {
    return namePattern.test(name);
}

/**
 * @param {string} roomName 
 * @returns {boolean}
 */
export function checkRoomName(roomName) {
    return roomNamePattern.test(roomName);
}