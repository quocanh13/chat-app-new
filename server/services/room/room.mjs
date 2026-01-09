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
export async function getRoomIDList({username}) {
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
        return result[0]
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

/**
 * @param {string} username 
 * @returns {Promise<import("../../public/utils/types.mjs").Room[] | "ERROR" | "ROOM DOES NOT EXIST">}
 */
export async function getRoomList({username}) {
    const roomIDList = await getRoomIDList({username})
    if(roomIDList == "ERROR") {
        return "ERROR" 
    } else {
        const roomList = []
        for(const id of roomIDList) {
            const room = await getRoomInformation(id.roomID)
            if(typeof room == "string") {
                return room
            } else {
                roomList.push(room)
            }
        }
        return roomList
    }
}

/**
 * 
 * @param {string} username 
 * @param {number} roomID 
 * @returns {Promise<boolean | "ERROR">}
 */
export async function isHost(username, roomID) {
    try {
        const result = await connection.query(
            `
                SELECT * FROM room WHERE room_id = ? AND username = ?
            `, [roomID, username]
        )
        if(result[0].length == 0) return false
        else return true
    } catch(err) {
        console.log(err)
        return  "ERROR"
    }
}

/**
 * @param {string} username 
 * @param {number} roomID 
 * @returns {Promise<"OK" | "ERROR" | "YOU ARE NOT THE HOST">}
 */
export async function deleteRoom(username, roomID) {
    const host = await isHost(username, roomID)
    if(host == "ERROR") {
        return "ERROR"
    } else if(host) {
        try {
            await connection.query(
                `
                    DELETE FROM message 
                    WHERE room_id = ?
                `, [roomID]
            )

            await connection.query(
                `
                    DELETE FROM user_in_room
                    WHERE room_id = ?
                `,[roomID]
            )

            await connection.query(
                `
                    DELETE FROM room WHERE room_id = ?
                `, [roomID]
            )
            return "OK"
        } catch(err) {
            console.log(err)
            return "ERROR"
        }
    } else return "YOU ARE NOT THE HOST"
}

// const input = {
//     username : "quocanh123aaa",
//     roomID : 99
// }

// console.log(await getLatestMessage(8));