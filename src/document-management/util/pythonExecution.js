const executePython = require("../../util/executePython");

const tasks = {
  encryption: "encryption",
  decryption: "decryption",
  ocrWithWatermark: "ocrWithWatermark",
  imageOcr: "imageOcr",
  ftpPdfWatermarkOCR: "ftpPdfWatermarkOCR",
  ftpImageWatermarkOCR: "ftpImageWatermarkOCR",
  ftpOcrAllFiles: "ftpOcrAllFiles",
  textWatermarkPDF: "textWatermarkPDF",
};

/**
 *
 * @param path location of file from root of app
 * @param action tasks of python operation define in tasks variable.
 * @returns data of python cli
 */
async function handlePyhonExecution(path, action) {
  console.log(`==== Action - ${action} => path - ${path} ====`);
  switch (action) {
    case tasks.encryption:
      return await executePython("python/encryptFile.py", path);
    case tasks.decryption:
      return await executePython("python/decryptFile.py", path);
    case tasks.imageOcr:
      return await executePython("python/imageOCR.py", path);
    case tasks.ocrWithWatermark:
      return await executePython("python/pdfOCRandWatermark.py", path);
    case tasks.textWatermarkPDF:
      return await executePython("python/textWatermarkPDF.py", path);
    case tasks.ftpPdfWatermarkOCR:
      return await executePython("python/ftpPdf.py", path);
    case tasks.ftpImageWatermarkOCR:
      return await executePython("python/ftpImage.py", path);
    case tasks.ftpOcrAllFiles:
      return await executePython("python/ftpOcrAll.py", path);
  }
}

module.exports = {
  handlePyhonExecution,
  tasks,
};
