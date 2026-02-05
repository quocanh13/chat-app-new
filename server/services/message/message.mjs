import connection from "../../configs/database.mjs";
import { ReceivingMessage, SendingMessage } from "../../public/utils/types.mjs";
import { getFileInformation } from "../file/file.mjs";
import { isInRoom } from "../room/room.mjs";

/**
 * @param {SendingMessage} sendingMessage 
 * @returns {Promise<"YOU ARE NOT IN ROOM" | "ERROR" | number | "USER OR ROOM DOES NOT EXIST" | "ERROR">}
 */
export async function createMessage(sendingMessage) {
    if(await isInRoom({
        username : sendingMessage.username,
        roomID : sendingMessage.roomID
    })) {
        try {
            const res = await connection.query(
                "INSERT INTO message(username, room_id, message, file_id) VALUES (?, ?, ?, ?)",
                [sendingMessage.username, sendingMessage.roomID, sendingMessage.message, sendingMessage.fileID]
            )
            
            return res[0].insertId;
        } catch (err) {
            console.log(err);
            if(err.code == "ER_NO_REFERENCED_ROW_2") {
                return "USER OR ROOM DOES NOT EXIST";
            } else {
                return "ERROR";
            }
        }
    } else {
        return "YOU ARE NOT IN ROOM";
    }

}

/**
 * @param {Object} param0 
 * @param {string} param0.roomID 
 * @param {number} param0.limit 
 * @param {number} param0.offset
 * @returns {Promise<import("mysql2").RowDataPacket | "LIMIT AND OFFSET ARE INVALID" | "ERROR">} 
 */
export async function getMessageList({roomID, limit, offset}) {
    try {
        const result = await connection.query(
            `
                SELECT 
                    m.username, 
                    u.name, 
                    message, 
                    sending_time AS time,
                    file_id AS fileID
                FROM message m
                    LEFT JOIN user u ON u.username = m.username
                WHERE m.room_id = ?
                ORDER BY time DESC, m.message_id DESC
                LIMIT ? OFFSET ?;
            `,
            [roomID, limit, offset]
        )
        const messageList = result[0]
        for(let i = 0; i < messageList.length; i++) {
            if(messageList[i].fileID != null) {
                const file = await getFileInformation(messageList[i].fileID)
                messageList[i].file = file
            }
        }
        return messageList
    } catch(err) {
        console.log(err);
        if(err.code == "ER_PARSE_ERROR") {
            return "LIMIT AND OFFSET ARE INVALID";
        } else {
            return "ERROR";
        }
    }
}

/**
 * 
 * @param {number} messageID 
 * @returns {Promise< ReceivingMessage | "THERE IS NO MESSAGE WITH THIS ID" | "ERROR">}
 */
export async function getMessageByID(messageID) {
    try {
        const result = await connection.query(
            `
                SELECT 
                    m.username, 
                    u.name, 
                    message, 
                    sending_time AS time,
                    file_id AS fileID,
                    room_id AS roomID 
                FROM message m
                    LEFT JOIN user u ON u.username = m.username
                WHERE m.message_id = ?;
            `,
            [messageID]
        );
        if(result[0].length == 1) {
            const message = result[0][0]
            if(message.fileID != null) {
                message.file = await getFileInformation(message.fileID)
            }
            return message
        } else {
            return `THERE IS NO MESSAGE WITH THIS ID`;
        }
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {number} roomID 
 * @returns {Promise <{message : string, name : string, username : string}>}
 */
export async function getLatestMessage(roomID) {
    try {
        const res = await connection.query(
            `
                SELECT 
                    m.message AS message, u.name AS name, u.username as username, m.file_id as fileID
                FROM message m 
                LEFT JOIN user u ON u.username = m.username
                WHERE m.room_id = ?
                ORDER BY m.sending_time desc, m.message_id DESC
                LIMIT 1;
            `, [roomID]
        )
        if(res[0].length == 0) {
            return {
                message : "Phòng mới được tạo",
                username : "",
                name : "Bạn"
            }
        } else {
            const message = res[0][0]
            if(message.fileID != null) {
                message.file = await getFileInformation(message.fileID)
            }
            return message
        }
    } catch (err) {
        console.log(err);
        return {
            message : "Server đang có lỗi không thể lấy thông tin về tin nhắn gần nhất",
            name : "Server",
            username : ""
        }
    }
}

/**@type {SendingMessage} */
const input = {
    username : "quocanh1",
    roomID : 8,
    message : "quocanh"
}
// console.log(await addMessage(input))
// console.log(await getMessageByID(829))
// console.log(await getMessageList({roomID : 8, limit : 20, offset : 0}));
