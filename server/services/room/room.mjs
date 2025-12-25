import connection from "../../configs/database.mjs";
import { getMemberList } from "./member.mjs";


/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {string} param0.roomName
 * @returns {Promise<number | "ERROR" | "ROOM NAME ALREADY EXISTED" | "ROOM NAME IS TOO LONG" | "USER DOES NOT EXIST">}
 */
export async function createRoom({username, roomName}) {
    try{
        await connection.query(
            "INSERT INTO ROOM(username, room_name) VALUES ( ?, ? )", 
            [username, roomName]
        );

        const roomID = (await connection.query(
            "SELECT room_id AS roomID FROM ROOM WHERE username = ? AND room_name = ?",
            [username, roomName]
        ))[0][0].roomID;

        await connection.query(
            "INSERT INTO USER_IN_ROOM(username, room_id) VALUES (?, ?)",
            [username, roomID]
        );
        return roomID;
    } catch (err) {
        console.log(err);
        if(err.code == "ER_DUP_ENTRY") {
            return "ROOM NAME ALREADY EXISTED";
        } else if(err.code == "ER_DATA_TOO_LONG") {
            return "ROOM NAME IS TOO LONG";
        } else if(err.code == "ER_NO_REFERENCED_ROW_2") {
            return "USER DOES NOT EXIST";
        } else {
            return "ERROR";
        }
    }
}

/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @returns {Promise<import("mysql2").RowDataPacket | "ERROR">}
 */
export async function getRoomList({username}) {
    try{
        const result = await connection.query(
            `
                SELECT
                    room.room_id AS roomID
                FROM
                    user_in_room 
                INNER JOIN
                    room ON user_in_room.room_id = room.room_id
                WHERE
                    user_in_room.username = ?;
            `, 
            [username]);
        return result[0];
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {Object} param0 
 * @param {string} param0.username
 * @param {number} param0.roomID
 * @returns {Promise<boolean>}
 */
export async function isInRoom({username, roomID}) {
    try {
        const result = await connection.query(
            "SELECT * FROM user_in_room WHERE username = ? AND room_id = ?;",
            [username, roomID]
        );
        if(result[0].length == 1) return true;
        else return false;
    } catch(err) {
        console.log(err);
        return false;
    }
}

/**
 * @param {number} roomID 
 * @returns {Promise<import("../../public/utils/types.mjs").Room | "ERROR" | "ROOM DOES NOT EXIST">}
 */
export async function getRoomInformation(roomID) {
    try {
        const roomInfo = await connection.query(
            `
                SELECT 
                    r.room_id as roomID,
                    r.room_name as roomName,
                    r.username as host
                FROM room r
                WHERE r.room_id = ?;
            `,
            [roomID]
        )
        if(roomInfo[0].length == 0) return "ROOM DOES NOT EXIST";
        const memberList = await getMemberList(roomID);
        if(memberList == "ERROR") {
            return "ERROR";
        } else {
            const result = roomInfo[0][0];
            result.memberList = memberList;
            return result;
        }
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

// const input = {
//     username : "quocanh123aaa",
//     roomID : 99
// }

// console.log(await getLatestMessage(8));