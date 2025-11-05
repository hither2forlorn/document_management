/**
 * file types
 */

const imageFileOptions = ["image/jpeg", "image/png", "image/jpg"];
const pdfOptions = ["application/pdf"];

encryptOptions = [...imageFileOptions, ...pdfOptions];
ocrOptions = [...imageFileOptions, ...pdfOptions];

module.exports = { ocrOptions, encryptOptions, imageFileOptions, pdfOptions };
