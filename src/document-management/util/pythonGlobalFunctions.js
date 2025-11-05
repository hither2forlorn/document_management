const { encryptOptions, imageFileOptions, pdfOptions } = require("../../util/FileTypes");
const { VENDOR_ENV } = require("../../config/credentials");

const { handlePyhonExecution, tasks } = require("./pythonExecution");
const PDFWatermark = require("pdf-watermark");
const handleWatermarkPosition = require("./getWatermarkPosition");
const { CustomWatermark, Document, Attachment, User } = require("../../config/database");
const { getAttachmentById } = require("./getModelDetail");

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
    return await handlePyhonExecution(att, tasks.pdfOcr);
  }
  // Image OCR
  else if (imageFileOptions.includes(attachmentType)) {
    return await handlePyhonExecution(att, tasks.imageOcr);
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

async function handleTextPDFWatermarkCustom(
  att,
  email,
  logo,
  date,
  customWatermarkID,
  isPreferredWatermark,
  userId,
  customWatermarkValue
) {
  const attachmentType = att.fileType;
  const data = {
    local: att.localPath,
    email,
    logo,
    key,
    isEncrypted: att.isEncrypted,
  };

  if (!isPreferredWatermark) {
    const getWatermarkPosition = customWatermarkValue ? customWatermarkValue : handleWatermarkPosition("1");
    const { imageOption, textOption } = getWatermarkPosition;
    const date = new Date().toLocaleString();

     // Assuming PDFWatermark needs x, y positions for text
  const pageWidth = 595; // Standard A4 width in points
  const pageHeight = 842; // Standard A4 height in points

  // Calculate text size, and adjust it as necessary to center it
  const text = email + "  " + date;
  const textWidth = 200; // Estimate the text width (you may need to calculate it dynamically)
  const textHeight = 20; // Estimate the text height

  // Position text at the center of the page
  const centerX = (pageWidth - textWidth) / 2;
  const centerY = (pageHeight - textHeight) - 800;

    return await PDFWatermark({
      text: email + "  " + date,
      pdf_path: att.localPath,
      image_path: logo,
      imageOption: imageOption,
      textOption: {
        ...textOption,  // Preserve existing options if any
        x: centerX, // Set X position for center alignment
        y: centerY, // Set Y position for center alignment
      },
    });
  } else {
    const getUser = await User.findOne({ where: { id: userId } });

    const watermarkId = getUser.dataValues.customWatermarkId;

    const getWatermark = await CustomWatermark.findOne({ where: { id: watermarkId } });
    const watermark = getWatermark.dataValues;

    const getWatermarkPosition = handleWatermarkPosition(watermark.watermarkPosition);
    const { imageOption, textOption } = getWatermarkPosition;

    return await PDFWatermark({
      text: watermark.watermarkText,
      pdf_path: att.localPath,
      image_path: watermark.watermarkImagePath,
      imageOption: imageOption,
      textOption: textOption,
    });
  }
}

async function handleTextPDFWatermark(att, email, logo, date, customWatermarkValue) {
  const getWatermarkPostion = handleWatermarkPosition(customWatermarkValue);
  const imageOption = getWatermarkPostion.imageOption;
  const textOption = getWatermarkPostion.textOption;
  const attachmentType = att.fileType;
  const data = {
    local: att.localPath,
    email,
    logo,
    key,
    isEncrypted: att.isEncrypted,
  };

  if (pdfOptions.includes(attachmentType)) {
    return await PDFWatermark({
      text: email + "  " + date,
      pdf_path: att.localPath,
      image_path: logo,
      imageOption: imageOption,
      textOption: textOption,
    });

    // return await handlePyhonExecution(data, tasks.textWatermarkPDF);
  }
}
//   }
// }

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
  handleTextPDFWatermarkCustom,
};
