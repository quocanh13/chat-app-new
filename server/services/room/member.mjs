import connection from "../../configs/database.mjs";
import { isInRoom } from "./room.mjs";

/**
 * @param {Object} param0 
 * @param {number} param0.roomID
 * @returns {Promise<import("server/public/utils/types.mjs").MemberInformation[] | "ERROR">}
 */
export async function getMemberList(roomID) {
    try {
        const result = await connection.query(
            `
                SELECT 
                    u.username as username,
                    u.name as name,
                    u.avatar as avatar
                FROM user_in_room uir
                    INNER JOIN user u ON u.username = uir.username
                WHERE uir.room_id = ?;
            `,
            [roomID]
        );
        return result[0];
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {string} param0.roomID
 * @returns {Promise<"OK" | "ERROR" | "USER OR ROOM DOES NOT EXIST" | "USER WAS ALREADY IN ROOM">}
 */
export async function addMember({username, roomID}) {
    try {
        const result = await connection.query(
            "INSERT INTO user_in_room(username, room_id) values (?, ?);",
            [username, roomID]
        )
        return "OK";
    } catch(err) {
        console.log(err);
        if(err.code == "ER_NO_REFERENCED_ROW_2") {
            return "USER OR ROOM DOES NOT EXIST"
        } else if(err.code == "ER_DUP_ENTRY") {
            return "USER WAS ALREADY IN ROOM";
        } else {
            return "ERROR";
        }
    }
}

/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {string} param0.roomID
 * @returns {Promise<boolean | "ERROR">}
 */
export async function isHost({username, roomID}) {
    try {
        const result = await connection.query(
            "SELECT username FROM room WHERE room_id = ? AND username = ?",
            [roomID, username]
        )
        if(result[0].length == 0) return false;
        else return true;
    } catch (err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {string} param0.roomID
 * @returns {Promise<"OK" | "ERROR" | "USER WAS NOT IN ROOM" | "CANNOT REMOVE HOST">}
 */
export async function removeMember({username, roomID}) {
    if(await isHost({username, roomID})) {
        return "CANNOT REMOVE HOST";
    }
    if(!(await isInRoom({username, roomID}))) {
        return "USER WAS NOT IN ROOM";
    }
    try {
        await connection.query(
            "DELETE FROM user_in_room WHERE username = ? AND room_id = ?",
            [username, roomID]
        )
        return "OK";
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}
