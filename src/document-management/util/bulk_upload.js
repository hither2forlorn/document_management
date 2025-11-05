const fs = require("fs");

/**
 * Uploads the attachment to the FTP
 * @method module:AttachmentModule#uploadAttachment
 * @param {Object} attachment - Attachment object sent from the Client side
 * @returns Attachment object similar to multer library to create a row in the database
 */
module.exports.uploadAttachment = async (attachment) => {
  if (!attachment) throw new Error("Image must not be null");
  const base64String = attachment.src;
  const base64Attachment = base64String.split(";base64,").pop();
  const filePath = "temp/" + Date.now() + "-" + attachment.name;
  fs.writeFileSync(filePath, base64Attachment, { encoding: "base64" });
  return {
    ...attachment.file,
    documentTypeId: attachment?.documentTypeId,
    documentIndex: attachment?.documentIndex,
    path: filePath,
  };
};
