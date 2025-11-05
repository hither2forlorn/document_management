/**
 * file types
 */

const imageFileOptions = ["image/jpeg", "image/png", "image/jpg"];
const pdfOptions = ["application/pdf"];

encryptOptions = [...imageFileOptions, ...pdfOptions];

module.exports = { encryptOptions, imageFileOptions, pdfOptions };
