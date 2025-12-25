/**
 * @param {string} fileType 
 */
export function isImage(mimeType) {
    return /^image\//.test(mimeType);
}