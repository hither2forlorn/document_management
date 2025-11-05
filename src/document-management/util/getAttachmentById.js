const { Attachment } = require("../../config/database");

async function getAttachmentById(attachId) {
  const attach = await Attachment.findOne({ where: { id: attachId } });
  return attach;
}

module.exports = { getAttachmentById };
