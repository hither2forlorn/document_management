const { Watermark } = require("../config/database");
const fs = require("fs");
const jimpWatermark = require("jimp-watermark");

/**
 * Function to overlay/watermark image/text over image
 * @method module:Utility#watermarkImage
 * @param {String} mainFilePath - Path of the image to watermark
 * @param {String} exportPath - Export path of the watermarked image
 * @param {Object} watermark  - Watermark object for watermarking the image
 */
async function watermarkImage(filePath, exportPath, watermark) {
  const options = {
    dstPath: exportPath,
    text: watermark.text,
    textSize: 8,
    opacity: 0.2,
  };

  if (watermark.isImage) {
    let imageData = new Buffer.from(watermark.image).toString("binary");
    imageData = imageData.split(",").slice(1, imageData.length).join(",");
    await fs.writeFile("./temp/watermark.jpg", imageData, "base64", function (err) {
      if (err) console.log(err);
    });
    await jimpWatermark.addWatermark(filePath, "./watermark/watermark.jpg", options);
    return true;
  } else {
    await jimpWatermark.addTextWatermark(filePath, options);
    return true;
  }
}

module.exports = async (filePath, exportPath, fileType) => {
  const watermarkDb = await Watermark.findOne({
    where: { isActive: true },
    raw: true,
  });
  if (watermarkDb) {
    switch (fileType) {
      // case "pdf":
      case "image":
        console.log(filePath, exportPath, watermarkDb);
        await watermarkImage(filePath, exportPath, watermarkDb);
        break;
      default:
        fs.writeFileSync(mainFilePath, exportPath);
        break;
    }
    return true;
  }
  return false;
};
