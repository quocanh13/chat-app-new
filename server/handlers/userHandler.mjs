import { getUserData } from "../services/user/user.mjs";
import {verify} from "../utils/jwt.mjs"
import { FileInformation, ServerResponse } from "../public/utils/types.mjs";
import { checkUsername, checkPassword, checkName } from "../utils/checkData.mjs";
import { register } from "../services/user/user.mjs";
import { getRoomList as DBGetRoomList } from "../services/room/room.mjs";
import { updateAvatar as DBUpdateAvatar } from "../services/user/user.mjs";
import { isImage } from "../public/utils/checkFileType.js";


/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export function verifyUser(req, res, next) {
    const userInformation = verify(req.cookies.token);
    if(userInformation == "ERROR" ) {
        /**@type {ServerResponse} */
        const resData = {
            type : "REDIRECT",
            redirectURL : "/index/index.html",
            message : "Token đã hết hạn, vui lòng quay lại trang đăng nhập",
            error : true
        }
        res.status(400).json(resData);
    } else {
        req.userInformation = userInformation;
        next();
    }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function getUserInformation(req, res) {
    const userInfor = await getUserData({username : req.params.username});
    if(userInfor == "ERROR") {
        /**@type {ServerResponse} */
        const resData = {
            type : "SERVER ERROR",
            message : "Server đang có lỗi. Vui lòng thử lại sau",
            error : true,
            displayMessage : true
        }
        res.status(500).json(resData)
    } else if(userInfor == "USER DOES NOT EXIST") {
        /**@type {ServerResponse} */
        const resData = {
            type : "BAD REQUEST",
            message : "User không tồn tại",
            error : true,
            displayMessage : true
        }
        res.status(500).json(resData)
    } else {
        /**@type {ServerResponse} */
        const resData = {
            type : "OK",
            data : userInfor    
        }
        res.status(200).json(resData)
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next
 */
export function checkData(req, res, next) {
    /**@type {ServerResponse} */
    let resData;
    if(!checkUsername(req.body.username) || !checkPassword(req.body.password)) {
        resData = {
            type : "BAD REQUEST",
            message : "Tên đăng nhập và mật khẩu phải chứa ít nhất 1 ký tự và không được chứa ký tự đặc biệt, chữ có dấu, khoảng trắng",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else if(!checkName(req.body.name)) {
        resData = {
            type : "BAD REQUEST",
            message : "Tên của bạn phải chứa ít nhất 1 ký tự và không được chứa ký tự đặc biệt, chữ số",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData); 
    }else {
        next();
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function postUser(req, res) {
    /**@type {ServerResponse} */
    let resData;
    const result = await register(req.body);
    if(result == "DATA ARE TOO LONG") {
        resData = {
            type : "BAD REQUEST",
            message : "Tên đăng nhập và mật khẩu không được quá 50 ký tự",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData)
    } else if(result == "USERNAME HAS ALREADY EXISTED") {
        resData = {
            type : "BAD REQUEST",
            message : "Tên dăng nhập đã tồn tại. Vui lòng thử tên khác",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData)
    } else if(result =="DATABASE ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server đang có lỗi. Vui lòng thử lại sau",
            error : true,
            displayMessage : true
        }
        res.status(500).json(resData)
    } else {
        resData = {
            type : "REDIRECT",
            redirectURL : "/index/index.html"
        }
        res.status(200).json(resData);
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getRoomList(req, res) {
    /**@type {ServerResponse} */
    let resData;
    if(req.userInformation.username != req.params.username) {
        resData = {
            type : "BAD REQUEST",
            message : "Bạn không có quyền truy cập vào thông tin này",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else {
        const list = await DBGetRoomList({username : req.params.username});
        if(list == "ERROR") {
            resData = {
                type : "SERVER ERROR",
                data : "Server đang có lỗi, vui lòng thử lại sau",
                error : true,
                displayMessage : true
            }
            res.status(500).json(resData);
        } else {
            resData = {
                type : "OK",
                data : list,
            }
            res.status(200).json(resData);
        }
    }

}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next
 */
export async function verifyAvatar(req, res, next) {
    req.file.originalname = Buffer.from(req.file.originalname, 'latin1').toString("utf-8");
    /**@type {FileInformation} */
    const avatar = {
        name : req.file.originalname,
        mimeType : req.file.mimetype,
        type : req.body.type,
        size : req.file.size,
        username : req.userInformation.username,
        data : req.file.buffer
    }
    /**@type {ServerResponse} */
    let resData;
    if(!isImage(avatar.mimeType)) {
        resData = {
            type : "BAD REQUEST",
            message : "MIME type must be image/",
            error : true,
            displayMessage : true
        }
        res.json(resData)
    } else {
        req.avatar = avatar;
        next();
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateAvatar(req, res) {
    const result = await DBUpdateAvatar(req.avatar);
    /**@type {ServerResponse} */
    let resData;
    if(result == "ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server đang có lỗi vui lòng thử lại sau",
            displayMessage : true,
            error : true
        }
        res.status(500).json(resData);
    } else {
        resData = {
            type : "OK",
            message : "Bạn đã cập nhật avatar thành công",
            displayMessage : true,
            data : {avatar : result},
            error : false
        }
        res.status(200).json(resData);
    }
}
