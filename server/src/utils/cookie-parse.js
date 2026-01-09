/**
 * @param {string} rawCookie 
 * @returns {Object<string, string>}
 */
export default function parse(rawCookie){
    const result = {};
    if(rawCookie.length != 0){
        rawCookie = rawCookie.replaceAll(" ", "");
        const cookies = rawCookie.split(";");
        for(let i = 0; i < cookies.length; i++){
            const temp = cookies[i].split("=");
            result[temp[0]] = temp[1];
        }
    }
    return result;
}

