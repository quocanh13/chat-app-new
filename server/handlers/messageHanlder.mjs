import { ServerResponse } from "../public/utils/types.mjs";
import { getMessageList as DBgetMessageList } from "../services/message/message.mjs"
import { getLatestMessage as DBGetLatestMessage } from "../services/message/message.mjs";

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getMessageList(req, res) {
    const result = await DBgetMessageList({
        roomID : req.params.roomID, 
        limit : Number(req.query.limit), 
        offset : Number(req.query.offset)
    });
    /**@type {ServerResponse} */
    let resData;
    if(result == "LIMIT AND OFFSET ARE INVALID") {
        resData = {
            type : "BAD REQUEST",
            message : "Limit hoặc offset không hợp lệ. Limit và offset phải là số nguyên không âm"
        }
        res.status(400).json(resData);
    } else if(result == "ERROR") {
        resData = {
            type : "SERVER ERROR",
            message : "Server đang có lỗi vui lòng thử lại sau"
        }
        res.status(500).json(resData);
    } else {
        resData = {
            type : "OK",
            data : result
        }
        res.status(200).json(resData);
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getLatestMessage(req, res) {
    const latestMessage = await DBGetLatestMessage(req.params.roomID);
    /**@type {ServerResponse} */
    let resData = {
        type : "OK",
        data : latestMessage
    }
    res.status(200).json(resData);
}