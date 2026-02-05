import { ServerResponse } from "../public/utils/types.mjs";
import { isHost, removeMember, addMember } from "../services/room/member.mjs";
import { isInRoom } from "../services/room/room.mjs";
import { addMember as socketAddMember, deleteMember as socketDeleteMember } from "../services/socket/socketHandler.mjs";


/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next
 */
export async function verifyPostMember(req, res, next) {
    const inRoom = await isInRoom({username : req.userInformation.username, roomID : req.params.roomID});
    /**@type {ServerResponse} */
    let resData;
    if(!inRoom) {
        resData = {
            type : "BAD REQUEST",
            message : "Bạn không ở trong phòng này",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else {
        next();
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function postMember(req, res) {
    const result = await addMember({username : req.body.memberUsername, roomID : req.params.roomID});

    /**@type {ServerResponse} */
    let resData
    if(typeof result == "object") {
        resData = {
            type : "OK",
            message : `Đã thêm ${req.body.memberUsername} vào phòng`,
            error : false,
            displayMessage : true,
            data : result
        }
        socketAddMember(req.params.roomID, req.body.memberUsername)
        res.status(200).json(resData);
    } else if(result == "USER OR ROOM DOES NOT EXIST") {
        resData = {
            type : "BAD REQUEST",
            message : `User hoặc phòng không tồn tại, vui lòng thử lại`,
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else if(result == "USER WAS ALREADY IN ROOM") {
        resData = {
            type : "BAD REQUEST",
            message : `User đã ở trong phòng rồi`,
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else {
        resData = {
            type : "SERVER ERROR",
            message : `Server hiện đang có lỗi, vui lòng thử lại sau`,
            error : true,
            displayMessage : true
        }
        res.status(500).json(resData);
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function deleteMember(req, res) {
    /**@type {ServerResponse} */
    let resData;
    if(isHost({username : req.userInformation.username, roomID : req.params.roomID})) {
        const result = await removeMember({username : req.params.username, roomID : req.params.roomID});
        if(result == "OK") {
            resData = {
                type : "OK",
                message : "Đã xóa thành công",
                error : false,
                displayMessage : true
            }
            socketDeleteMember(req.params.roomID, req.params.username)
            res.status(200).json(resData);
        } else if(result == "CANNOT REMOVE HOST") {
            resData = {
                type : "BAD REQUEST",
                message : "Không thể xóa chủ phòng",
                error : true,
                displayMessage : true
            }
            res.status(400).json(resData);            
        } else if(result == "USER WAS NOT IN ROOM") {
            resData = {
                type : "BAD REQUEST",
                message : "User không có ở trong phòng",
                error : true,
                displayMessage : true
            }
            res.status(400).json(resData);    
        } else {
            resData = {
                type : "SERVER ERROR",
                message : "Server đang có lỗi, vui lòng thử lại sau",
                error : true,
                displayMessage : true
            }
            res.status(500).json(resData);                
        }
    } else {
        resData = {
            type : "BAD REQUEST",
            message : "Bạn không có quyền xóa thành viên",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    }

}