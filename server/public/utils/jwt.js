/**
 * @param {string} input 
 * @returns {Uint8Array}
 */
function base64ToByte(input) {
    const s = atob(input);
    const bytes = new Uint8Array(s.length);

    for(let i = 0; i < s.length; i++) {
        bytes[i] = s.charCodeAt(i);
    }
    return bytes;
}

/**
 * @param {string} token 
 * @returns {Object}
 */
export function getData(token) {
    const payload = new TextDecoder('utf-8').decode(base64ToByte(token.split('.')[1]));
    return JSON.parse(payload);
}