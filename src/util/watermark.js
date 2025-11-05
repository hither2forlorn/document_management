const { Watermark } = require("../config/database");
const fs = require("fs");
const jimpWatermark = require("mod-jimp-watermark");
const moment = require("moment");

/**
 * Function to overlay/watermark image/text over image
 * @method module:Utility#watermarkImage
 * @param {String} mainFilePath - Path of the image to watermark
 * @param {String} exportPath - Export path of the watermarked image
 * @param {Object} watermark  - Watermark object for watermarking the image
 */
async function watermarkImage(filePath, exportPath, watermark, user) {
  const options = {
    dstPath: exportPath,
    text: `${user?.email || ""}  ${moment().format("YYYY-MM-DD")}`,
    textSize: 4,
    opacity: 0.5,
  };

  if (watermark.isImage) {
    // watermark for image
    await jimpWatermark.addTextWithImageWatermark(filePath, watermark.image, options);

    return true;
  } else {
    await jimpWatermark.addTextWatermark(filePath, options);
    return true;
  }
}

module.exports = async (filePath, exportPath, fileType, user) => {
  const watermarkDb = await Watermark.findOne({
    where: { isActive: true },
    raw: true,
  });
  if (watermarkDb) {
    switch (fileType) {
      // case "pdf":
      case "image":
        await watermarkImage(filePath, exportPath, watermarkDb, user);
        break;
      default:
        // fs.writeFileSync(mainFilePath, exportPath);
        break;
    }
    return true;
  }
  return false;
};
