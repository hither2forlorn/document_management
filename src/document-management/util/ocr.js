const { Attachment } = require("../../config/database");

async function add_content_to_attachment(id, content) {
  await Attachment.update({ attachmentDescription: content, ocr: true }, { where: { id } });
}

export { add_content_to_attachment };
