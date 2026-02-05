import { ServerResponse } from "../public/utils/types.mjs";
import { getRoomInformation as DBgetRoomInformation, createRoom, deleteRoom as DBDeleteRoom, isInRoom } from "../services/room/room.mjs";
import { checkRoomName } from "..//utils/checkData.mjs";
import {verify} from "../utils/jwt.mjs"
import { getLatestMessage } from "../services/message/message.mjs";
import { deleteAllMember } from "../services/socket/socketHandler.mjs";

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getRoomInformation(req, res) {
    const roomInfo = await DBgetRoomInformation(req.params.roomID);
    /**@type {ServerResponse} */
    let resData;
    if(roomInfo == "ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server đang có lỗi, vui lòng thử lại sau",
            error : true,
            displayMessage : true
        }
        res.status(500).json(resData);
    }else if(roomInfo == "ROOM DOES NOT EXIST") {
        resData = {
            type : "BAD REQUEST",
            message : `Phòng có id = ${req.params.roomID} không tồn tại`,
            error : true,
            displayMessage : true
        }
        res.status(404).json(resData);        
    } else {
        const latestMessage = await getLatestMessage(roomInfo.roomID);
        roomInfo.latestMessage = latestMessage;
        resData = {
            type : "OK",
            data : roomInfo
        }
        res.status(200).json(resData);   
    }
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export async function verifyPostRoomData(req, res, next) {
    const userInfo = verify(req.cookies.token);
    if( userInfo == "ERROR") {

    } else {
        if(checkRoomName(req.body.roomName)) {
            next();
        } else {
            /**@type {ServerResponse} */
            let resData;
            resData = {
                type : "BAD REQUEST",
                message : "Tên phòng phải chứa ít nhất 1 ký tự và không được chứa ký tự đặc biệt",
                error : true,
                displayMessage : true
            }
            res.status(400).json(resData);
        }        
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function postRoom(req, res) {
    const result = await createRoom({
        username : req.userInformation.username,
        roomName : req.body.roomName
    });
    /**@type {ServerResponse} */
    let resData;
    if(result == "ROOM NAME ALREADY EXISTED") {
        resData = {
            type : "BAD REQUEST",
            message : "Tên phòng đã tồn tại",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else if(result == "ROOM NAME IS TOO LONG") {
        resData = {
            type : "BAD REQUEST",
            message : "Tên phòng chỉ được chứa tối đa 100 ký tự",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else if(result == "USER DOES NOT EXIST") {
        resData = {
            type : "BAD REQUEST",
            message : "User không tồn tại",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else if(result == "ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server hiện đang có lỗi, vui lòng thử lại sau",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else {
        resData = {
            type : "OK",
            message : "Bạn đã tạo phòng thành công",
            data : result,
            error : false,
            displayMessage : true
        }
        res.status(200).json(resData);
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next
 */
export async function verifyInRoom(req, res, next) {
    const userInfo = verify(req.cookies.token);
    /**@type {ServerResponse} */
    let resData;
    if(!isInRoom({username : userInfo.username, roomID : req.params.roomID})) {
        resData = {
            type : "BAD REQUEST",
            message : "Bạn không ở trong phòng này",
            error : true,
            displayMessage : true
        }
    } else {
        next();
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function deleteRoom(req, res) {
    const result = await DBDeleteRoom(
        req.userInformation.username,
        req.params.roomID
    )
    /**@type {ServerResponse} */
    let resData;
    if(result == "OK") {
        resData = {
            type : "OK",
            message : "Bạn đã xóa phòng thành công",
            data : result,
            error : false,
            displayMessage : true
        }
        deleteAllMember(req.params.roomID)
        res.status(200).json(resData);
    } else if(result == "YOU ARE NOT THE HOST") {
        resData = {
            type : "BAD REQUEST",
            message : "Bạn không phải là chủ phòng này nên không thể xóa phòng",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else {
        resData = {
            type : "SERVER ERROR",
            message : "Server hiện đang có lỗi, vui lòng thử lại sau",
            error : true,
            displayMessage : true
        }
        res.status(500).json(resData);
    }
}

