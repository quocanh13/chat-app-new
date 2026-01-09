export class Member{
    /**@type {string}*/ 
    username
    /**@type {string}*/ 
    name
}
export class User{
    /**@type {string} */
    username;
    /**@type {string} */
    name;
    /**@type {number} */
    avatar;
}
export class Room{
    /**@type {number} */
    roomID;
    /**@type {string} */ 
    roomName;
    /**@type {string} */ 
    token;
    /**@type {string} */ 
    host;
    /**@type {string} */ 
    roomName;
    /**@type {Member[]} */
    memberList;
    /**@type {ReceivingMessage[]} */
    messageList;
    /**@type {number} */
    offset;
    /**@type { {message : string, username : string, name : string} } */
    latestMessage;
}

export class ServerResponse{
    /**@type {"OK" | "SERVER ERROR" | "REDIRECT" | "BAD REQUEST"} */
    type;
    /**@type {*} */
    data;
    /**@type {string} */
    message;
    /**@type {boolean} */
    error;
    /**@type {string} */
    redirectURL;
    /**@type {boolean} */
    displayMessage;
}

export class SendingMessage{
    /**@type {string}*/ 
    message;
    /**@type {number} */
    roomID;
    /**@type {string}*/ 
    username;
    /**@type {string}*/ 
    name;
    /**@type {number} */
    fileID;
}

export class ReceivingMessage{
    /**@type {"MESSAGE" | "BAD REQUEST" | "SERVER ERROR"} */
    type;
    /**@type {string}*/ 
    message;
    /**@type {number} */
    roomID;
    /**@type {string}*/ 
    username
    /**@type {string}*/ 
    name
    /**@type {string}*/ 
    time;
    /**@type {number} */
    fileID;
    /**@type {number} */
    messageID;
}

export class FileInformation{
    /**@type {number} */
    id;
    /**@type {string} */
    name;
    /**@type {string} */
    mimeType;
    /**@type {number} */
    size;
    /**@type {"AVATAR" | "MESSAGE"} */
    type;
    /**@type {string} */
    username;
    /**@type {Int8Array | Buffer} */
    data;
    /**@type {string} */
    time;
    /**@type {number} */
    roomID;
}
