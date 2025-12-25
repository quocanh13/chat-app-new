import jwt from 'jsonwebtoken';

/**
 * @param {Buffer<ArrayBufferLike> | Object<string, any>} payload 
 * @param {string} [exprireIn] - "1s", "1m", "1h", "1d", "1y"
 * @returns {string}
 */
export function sign(payload, expiresIn = "1s"){
    return jwt.sign(payload, process.env.JWT_SCRETE_KEY, {expiresIn});
}

/**
 * @param {string} token 
 * @returns {jwt.JwtPayload | "ERROR"}
 */
export function verify(token){
    try{
        const result = jwt.verify(token, process.env.JWT_SCRETE_KEY);
        return result;
    }catch(err) {
        return ("ERROR");
    }
};
