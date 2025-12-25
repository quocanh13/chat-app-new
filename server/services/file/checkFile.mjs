import connection from "../../configs/database.mjs";

/**
 * @param {number} id 
 * @returns {Promise<number | "FILE IS NOT IN A ROOM" | "ERROR">}
 */
export async function fileInRoom(id) {
    try {
        const result = await connection.query(
            `
                SELECT m.room_id AS roomID FROM
                (
                    SELECT room_id, file_id FROM message
                    WHERE file_id = ?
                ) AS m
                INNER JOIN file f ON f.file_id = m.file_id;
            `,[id]
        )
        if(result[0].length == 0) return "FILE IS NOT IN A ROOM"
        return result[0][0].roomID;
    } catch(err) {
        console.log(err);
        return "ERROR"
    }
}

// console.log(await fileInRoom(4));