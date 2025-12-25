import connection from "../../configs/database.mjs";
import {FileInformation} from "../../public/utils/types.mjs"
import {readFile} from "fs/promises"

/**
 * @param {FileInformation} file 
 * @returns {Promise<number | "ERROR">}
 */
export async function createFile(file) {
    try {
       const res = await connection.query(
        `
            INSERT INTO file(data, mime_type, file_name, type, username, file_size) VALUES (?, ?, ?, ?, ?, ?);
        `, [file.data, file.mimeType, file.name, file.type, file.username, file.size]
       );
       return res[0].insertId;
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {number} fileID 
 * @returns {Promise<"OK" | "ERROR">}
 */
export async function deleteFile(fileID) {
    try{
        await connection.query("DELETE FROM file WHERE file_id = ?", [fileID]);
        return "OK"
    }catch(err) {
        console.log(err);
        return "ERROR"
    }
}

/**
 * @param {Object} param0 
 * @param {number} param0.id
 * @returns {Promise<FileInformation | "FILE DOES NOT EXIST" | "ERROR">}  
 */
export async function getFile(id) {
    try {
        const file = await connection.query(
            `
                SELECT 
                    file_id AS id, 
                    data, 
                    mime_type AS mimeType, 
                    file_name AS name, type, 
                    sending_time AS time, 
                    username, 
                    file_size AS size
                FROM file
                WHERE file_id = ?;
            `, [id]
        );
        if(file[0].length == 0) {
            return "FILE DOES NOT EXIST";
        }
        return file;
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {Object} param0 
 * @param {number} param0.id
 * @returns {Promise<FileInformation | "FILE DOES NOT EXIST" | "ERROR">}  
 */
export async function getFileInformation(id) {
    try {
        const file = await connection.query(
            `
                SELECT 
                    file_id AS id, 
                    mime_type AS mimeType, 
                    file_name AS name, 
                    type, 
                    room_id AS roomID,
                    sending_time AS time, 
                    username, 
                    file_size AS size
                FROM file
                WHERE file_id = ?;
            `, [id]
        );
        if(file[0].length == 0) {
            return "FILE DOES NOT EXIST";
        }
        return file[0][0];
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * @param {Object} param0 
 * @param {number} param0.id
 * @returns {Promise<Buffer | "FILE DOES NOT EXIST" | "ERROR">}  
 */
export async function getFileData(id) {
    try {
        const file = await connection.query(
            `
                SELECT 
                    data
                FROM file
                WHERE file_id = ?;
            `, [id]
        );
        if(file[0].length == 0) {
            return "FILE DOES NOT EXIST";
        }
        return file[0][0].data;
    } catch(err) {
        console.log(err);
        return "ERROR";
    }
}

/**
 * 
 * @param {string} username 
 * @returns {Promise<"ERROR" | number | null>}
 */
export async function getAvatarID(username) {
    try {
        const avatar = await connection.query(
            `
                SELECT avatar FROM user WHERE username = ?
            `, [username]
        )
        return avatar[0][0].avatar;
    } catch (err) {
        console.log(err);
        return "ERROR"
    }
}
/**@type {FileInformation} */
const file = {
    name : "server.mjs",
    type : "MESSAGE",
    mimeType : "text/javascipt",
    size : 0,
    username : "quocanh1",
}


// const fileData = readFile("./server/server.mjs").then((data)=>{
//     file.data = data;
//     createFile(file);
// });

// console.log((await getFileData(4)))
