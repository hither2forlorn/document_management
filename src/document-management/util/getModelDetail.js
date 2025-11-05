const { Document, Attachment } = require("../../config/database");
const { execSelectQuery } = require("../../util/queryFunction");

/**
 *
 * Get document data from either document or attachment.
 *
 * @param {*} itemId can be attachment or document id
 * @param {Boolean} getDataFromAttachment true then search for attachment id
 *
 * Retrive document from attachment Id or document Id
 * @returns document data
 */

const getDocument = async (itemId, getDataFromAttachment) => {
  let data;
  const query = `select d.hasOtp ,d.securityLevel,d.otherTitle , d.createdBy,  d.hasEncryption,d.isApproved,d.returnedByChecker,d.id,d.sendToChecker,d.createdBy, a.name, a.fileType, a.filePath from documents d join attachments a on a.itemId = d.id where a.id=${itemId}`;

  if (getDataFromAttachment) data = await execSelectQuery(query);
  // get Data form document ID
  else
    data = await Document.findOne({
      where: { id: itemId },
    });

  return data;
};

// Get attachment object with attachment id
async function getAttachmentById(attachId) {
  const attach = await Attachment.findOne({ where: { id: attachId } });
  return attach;
}

module.exports = { getAttachmentById, getDocument };
