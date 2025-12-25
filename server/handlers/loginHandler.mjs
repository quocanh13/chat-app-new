import { checkUsername, checkPassword } from "../utils/checkData.mjs";
import { login, getUserData } from "../services/user/user.mjs";
import { sign, verify } from "../utils/jwt.mjs";
import { ServerResponse } from "..//public/utils/types.mjs";

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next
 */
export function checkData(req, res, next) {
    if(checkUsername(req.body.username) && checkPassword(req.body.password)) {
        next();
    } else {
        /**@type {ServerResponse} */
        let resData = {
            type : "BAD REQUEST",
            message : "Tên đăng nhập và mật khẩu phải chứa ít nhất 1 ký tự và không được chứa ký tự đặc biệt, chữ có dấu, khoảng trắng",
            error : true,
            displayMessage : true
        };
        res.status(400).json(resData);
    }
}

/**
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function loginHandler(req, res) {
    const result = await login(req.body);
    /**@type {ServerResponse} */
    let resData;
    if(result == "USERNAME DOES NOT EXIST") {
        resData = {
            type : "BAD REQUEST",
            message : "Tên đăng nhập không tồn tại. Vui lòng kiểm tra lại tên đăng nhập của bạn",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else if(result == "PASSWORD IS INCORRECT") {
        resData = {
            type : "BAD REQUEST",
            message : "Mật khẩu của bạn không đúng",
            error : true,
            displayMessage : true
        }
        res.status(400).json(resData);
    } else if(result == "DATABASE ERROR") {
        resData = {
            type : "BAD REQUEST",
            message : "Server đang có lỗi. Vui lòng thử lại sau",
            error : true,
            displayMessage : true
        }
        res.status(500).json(resData);
    } else {
        const userData = await getUserData({username : req.body.username});
        if(userData == "ERROR") {
            resData = {
                type : "BAD REQUEST",
                message : "Server đang có lỗi. Vui lòng thử lại sau",
                error : true,
                displayMessage : true
            }
            res.status(500).json(resData);
        } else {
            const token = sign(userData,"1h");
            res.cookie("token", token, {path : "/"}).status(200);
            resData = {
                type : "REDIRECT",
                redirectURL : "/chat-app/chat-app.html"
            }
            res.status(200).json(resData);
        }

    }
}