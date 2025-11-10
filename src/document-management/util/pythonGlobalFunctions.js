const { encryptOptions, imageFileOptions, pdfOptions } = require("../../util/FileTypes");
const { VENDOR_ENV } = require("../../config/credentials");

const { handlePyhonExecution, tasks } = require("./pythonExecution");

const key = VENDOR_ENV.encryptionKey;

/**
 *
 * OCR with Image OCR
 * [Must] add localpath in attachment object
 *
 * @param {*} att attachment data
 * @returns python console data
 */
async function handleOCRFile(att) {
  const attachmentType = att.fileType;

  // PDF OCR with watermark
  if (pdfOptions.includes(attachmentType)) {
    return await handlePyhonExecution(att.localPath, tasks.ocrWithWatermark);
  }
  // Image OCR
  else if (imageFileOptions.includes(attachmentType)) {
    return await handlePyhonExecution(att.localPath, tasks.imageOcr);
  }
}

/**
 * Encryption
 *
 * @param {*} att must contains local and remote attributes
 * @returns null
 */
async function handleEncryptFile(att) {
  att.key = key;

  // const attachmentType = att.fileType;

  // if (encryptOptions.includes(attachmentType)) {
  await handlePyhonExecution(att, tasks.encryption);
  // }
}

/**
 * Encryption
 *
 * @param {*} att must contains local and remote attributes
 * @returns null
 */
async function handleDecryptFile(att) {
  att.key = key;
  // const attachmentType = att.fileType;

  // if (encryptOptions.includes(attachmentType)) {
  await handlePyhonExecution(att, tasks.decryption);
  // }
}

/***
 * HandleWatermarkPdf for local file
 * [Must] add localpath in attachment object
 *
 * @param {att} att attachment object
 * @return null
 */
async function handleTextPDFWatermark(att, email, logo) {
  const attachmentType = att.fileType;
  const data = {
    local: att.localPath,
    email,
    logo,
    key,
    isEncrypted: att.isEncrypted,
    createdAt: att.createdAt
  };

  if (pdfOptions.includes(attachmentType)) {
    return await handlePyhonExecution(data, tasks.textWatermarkPDF);
  }
}

/**
 *
 * @param {*} att attachment object
 * @returns
 */
async function pyFTPocrFile(att) {
  return await handlePyhonExecution(att, tasks.ftpOcrAllFiles);
}

module.exports = {
  handleOCRFile,
  handleEncryptFile,
  handleDecryptFile,
  handleTextPDFWatermark,
  pyFTPocrFile,
};
