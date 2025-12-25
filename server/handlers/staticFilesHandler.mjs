/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export function getIndex(req, res) {
    res.redirect("/index/index.html");
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */

export function getRegister(req, res) {
    res.redirect("/register/register.html");
}

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */

export function getChatApp(req, res) {
    res.redirect("/chat-app/chat-app.html");
}