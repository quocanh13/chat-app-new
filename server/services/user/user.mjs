import connection from "../../configs/database.mjs";
import { FileInformation } from "../../public/utils/types.mjs";
import { checkName } from "../../utils/checkData.mjs";
import { createFile, deleteFile, getAvatarID } from "../file/file.mjs";
import { isInRoom, isHost } from "../room/room.mjs";

/**
 * @param {object} param0 
 * @param {string} param0.username
 * @param {string} param0.password
 * @returns {Promise<"USERNAME DOES NOT EXIST" | "PASSWORD IS INCORRECT" | "DATABASE ERROR" | "VALID">}
 */
export async function login({username, password}) {
    try{
        const result = await connection.query(
            "SELECT * FROM USER WHERE USERNAME = ?;", 
            [username]
        );
        if(result[0].length == 0) {
            return "USERNAME DOES NOT EXIST";
        } else {
            if(result[0][0].password != password) {
                return "PASSWORD IS INCORRECT";
            } else {
                return "VALID"
            }
        }
    } catch(err) {
        return "DATABASE ERROR";
    }
}

/**
 * @param {object} param0 
 * @param {string} param0.username
 * @param {string} param0.password
 * @param {string} param0.name
 * @returns {Promise<"USERNAME HAS ALREADY EXISTED" | "DATABASE ERROR" | "DATA ARE TOO LONG" | "VALID">}
 */
export async function register({username, password, name}) {
    try{
        await connection.query(
            "INSERT INTO USER (USERNAME, PASSWORD, NAME) values (?, ?, ?);", 
            [username, password, name]
        );
        return "VALID";
    } catch(err) {
        console.log(err);
        if(err.code == "ER_DUP_ENTRY") {
            return "USERNAME HAS ALREADY EXISTED";
        } else if(err.code == "ER_DATA_TOO_LONG") {
            return "DATA ARE TOO LONG";
        } else {
            return "DATABASE ERROR";
        }
    }
}

/**
 * @param {*} param0 
 * @param {string} param0.username
 * @return {Promise<{username : string, name : string} | "ERROR" | "USER DOES NOT EXIST">}
 */
export async function getUserData({username, getPassword = true}) {
    try {
        let password = ", password"
        if(getPassword == false) password = ""
        const result = await connection.query(
            `SELECT username, name, avatar${password} FROM user WHERE username = ?;`,
            [username]
        );
        if(result[0].length == 0) return "USER DOES NOT EXIST"
        else return result[0][0];
    } catch (err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {string} username 
 * @returns {Promise<"OK" | "ERROR">}
 */
async function deletePreviousAvatar(username) {
    const avatar = await getAvatarID(username);
    if(typeof(avatar) == "number") {
        try {
            await connection.query(
                "UPDATE user SET avatar = NULL WHERE username = ?", [username]
            )
            const res = await deleteFile(avatar)
            return res;
        } catch(err) {
            console.log(err);
            return "ERROR";
        }
    } else if(avatar == "ERROR") {
        return "ERROR";
    } else return "OK";
}

/**
* @param {FileInformation} avatar 
* @returns {Promise<number | "ERROR">}
*/
export async function updateAvatar(avatar) {
    const deletePre = await deletePreviousAvatar(avatar.username)
    if(deletePre == "OK") {
        const fileID = await createFile(avatar);
        if(typeof fileID == "number") {
            try{
                await connection.query(
                    `
                        UPDATE user 
                        SET avatar = ?
                        WHERE username = ?
                    `, [fileID, avatar.username]
                )
                return fileID;
            } catch(err) {
                await deleteFile(fileID);
                console.log(err);
                return "ERROR";
            }
        } else {
            return "ERROR"
        }
    } else {
        return "ERROR";
    }

}

/**
 * @param {string} username 
 * @param {string} password 
 * @param {string} name 
 * @returns {Promise<"OK" | "ERROR">}
 */
export async function updateUserInformation(username, password, name) {
    try {
        if(password != "" && password != undefined && password != null) {
            try {
                await connection.query(
                    `
                        UPDATE user 
                        SET password = ?
                        WHERE username = ?
                    `, [password, username]
                )
            } catch (err) {
                console.log(err)
                return "ERROR"
            }
        } 
        if(name != "" && name != undefined && name != null && checkName(name)) {
            try {
                await connection.query(
                    `
                        UPDATE user 
                        SET name = ?
                        WHERE username = ?
                    `, [name, username]
                )
            } catch (err) {
                console.log(err)
                return "ERROR"
            }
        } 
        return "OK"
    } catch(err) {
        console.log(err)
        return "ERROR"
    }
}

/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {string} param0.roomID
 * @returns {Promise<"OK" | "ERROR" | "USER WAS NOT IN ROOM" | "HOST CANNOT LEAVE ROOM">}
 */
export async function leaveRoom({username, roomID}) {
    try {
        const inRoom = await isInRoom({username, roomID}) 
        if(inRoom == false) return "USER WAS NOT IN ROOM"
        console.log({username, roomID})
        const _isHost = await isHost(username, roomID)
        if(_isHost == "ERROR") return "ERROR"
        else if(_isHost == true) return "HOST CANNOT LEAVE ROOM"

        const res = await connection.query(
            `
                DELETE FROM user_in_room WHERE username = ? AND room_id = ?
            `, [username, roomID]
        )
        return "OK"
    }catch(err) {
        console.log(err)
        return "ERROR"
    }
}