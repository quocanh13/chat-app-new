import express from "express";
import { getFileInformation as DBgetFileInformation, getFileData as DBgetFileData, createFile } from "../services/file/file.mjs";
import { FileInformation, ServerResponse } from "../public/utils/types.mjs";
import { isInRoom } from "../services/room/room.mjs";
import multer from "multer";

/**
 * @param {express.Request} req
 * @param {express.Response} res  
 * @param {express.NextFunction} next 
 */
export async function canAccessFile(req, res, next) {
    /**@type {FileInformation} */
    const fileInformation = await DBgetFileInformation(req.params.id);
    req.fileInformation = fileInformation;
    /**@type {ServerResponse} */
    let resData;
    if(fileInformation.type == "AVATAR") {
        return next();
    } else if(fileInformation.type == "MESSAGE") {
        if(isInRoom({username : req.userInformation.username, roomID : fileInformation.roomID})) {
            return next();
        } else {
            resData = {
                type : "BAD REQUEST",
                message : "Bạn không có quyền truy cập vào file này"
            }
            res.status(400);
        }
    } else {
        resData = {
            type : "BAD REQUEST",
            message : "Kiểu sử dụng của file không hợp lệ"
        }        
    }
    res.json(resData);
}

/**
 *@param {express.Request} req
 *@param {express.Response} res  
 */
export async function getFileInfromation(req, res) {
    /**@type {ServerResponse} */
    let resData;
    if(req.fileInformation == "ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server hiện đang có lỗi vui lòng thử lại sau"
        }
        res.status(500);
    } else if(req.fileInformation == "FILE DOES NOT EXIST") {
        resData = {
            type : "BAD REQUEST",
            message : "File không tồn tại"
        }
        res.status(404);
    } else {
        resData = {
            type : "OK",
            data : req.fileInformation
        }
        res.status(200);
    }
    res.json(resData);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res  
 * @param {express.NextFunction} next 
 */
export async function getFileDataFromDB(req, res, next) {
    const data = await DBgetFileData(req.fileInformation.id);
    if(data == "ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server hiện đang có lỗi vui lòng thử lại sau"
        }
        res.status(500).json(resData); 
    } else if(data == "FILE DOES NOT EXIST") {
        resData = {
            type : "BAD REQUEST",
            message : "File không tồn tại"
        }
        res.status(404).json(resData);
    } else {
        req.fileInformation.data = data;
        next();
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res  
 */
export async function getFileData(req, res) {
    res.status(200)
        .setHeader("Content-Type", req.fileInformation.mimeType)
        .end(req.fileInformation.data);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res  
 * @param {express.NextFunction} next 
 */
export async function checkPostFile(req, res, next) {

    /**@type {ServerResponse} */
    let resData;
    if(req.file == null || req.file == undefined) {
        resData = {
            type : "BAD REQUEST",
            message : "Không có file nào được đính kèm"
        }
    } else {
        const type = req.body.type, roomID = req.body.roomID;
        if(type == "MESSAGE") {
            if(await isInRoom({
                username : req.userInformation.username,
                roomID
            })) {
                return next();
            } else {
                resData = {
                    type : "BAD REQUEST",
                    message : "Bạn không ở trong phòng này"
                }
                res.status(400);
            }
        } else {
            resData = {
                type : "BAD REQUEST",
                message : "Kiểu sử dụng của file không hợp lệ"
            }
            res.status(400);
        }
        res.json(resData);        
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res  
 */
export async function postFile(req, res) {
    /**@type {ServerResponse} */
    let resData;
    /**@type {FileInformation} */
    const fileInformation = {
        name : Buffer.from(req.file.originalname, 'latin1').toString("utf-8"),
        mimeType : req.file.type,
        type : req.body.type,
        roomID : req.body.roomID,
        data : req.file.buffer,
        size : req.file.size,
        username : req.userInformation.username
    }
    const fileID = await createFile(fileInformation);
    if(fileID == "ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server đang có lỗi vui lòng thử lại sau",
            displayMessage : true,
            error : true
        }
        res.status(500);
    } else {
        resData = {
            type : "OK",
            data : {fileID : fileID}
        }
        res.status(200);
    }
    res.json(resData);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res  
 */
export async function downloadFile(req, res) {
    res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeFileName(req.fileInformation.name)}`);
    res.end(req.fileInformation.data);
}

/**
 * @param {string} fileName 
 */
function encodeFileName(fileName) {
    if(fileName == null || fileName == undefined) {
        return "";
    } else {
        fileName = encodeURIComponent(fileName);
        fileName = fileName.replace(/'/g, '%27')
                        .replace(/\(/g, '%28')
                        .replace(/\)/g, '%29');
        return fileName;
    }
}
