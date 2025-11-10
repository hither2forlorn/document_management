const { Attachment } = require("../../config/database");
const { ftp, config, checkFtp } = require("../../config/filesystem");
const watermark = require("../../util/watermark");
const fs = require("fs");
const _ = require("lodash");
const fileserver = require("../../config/fileserver");
const logger = require("../../config/logger");

function getFileType(fileType) {
  if (fileType.includes("image")) {
    return "image";
  } else if (fileType.includes("pdf")) {
    return "pdf";
  } else {
    return "other";
  }
}

function compressAttachment(filePath) {
  return fileserver.post(`/compress`, { filePath }).then((res) => {
    return res.data;
  });
}

async function uncompressAttachment(filePath) {
  return fileserver.post(`/uncompress`, { filePath }).then((res) => {
    return res.data;
  });
}

async function downloadAttachmentFromFtp(localPath, ftpPath) {
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isConnected) {
    ftp.connect(config);
    const isSuccess = await new Promise((resolve) => {
      ftp.download(ftpPath, localPath, (err) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    ftp.close();
    return isSuccess;
  } else {
    return false;
  }
}

async function uploadAttachments(attachments) {
  // check ftp connection
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));

  if (isConnected) {
    ftp.connect(config);
    // structure for attachment uplaod
    const uploadArr = attachments.map((att) => {
      return {
        remote: att.filePath,
        local: att.localPath,
      };
    });

    const isSuccess = await new Promise((resolve) => {
      ftp.upload(uploadArr, "/", (err) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    // Insert into attachment table
    if (isSuccess) {
      await Promise.all(
        attachments.map((attachment) => {
          return Attachment.create(attachment);
        })
      );
    }
    ftp.close();
    return isSuccess;
  } else {
    return false;
  }
}

async function downloadAttachmentsWithWatermark(allAttachments) {
  const watermarkPath = "temp/watermark/";
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isConnected) {
    ftp.connect(config);
    const attachments = _.filter(allAttachments, (at) => {
      const isExist = fs.existsSync("temp/" + at.filePath);
      return !isExist;
    });
    const downloadArr = attachments.map((att) => {
      return {
        remote: att.filePath,
        local: watermarkPath + att.filePath,
      };
    });
    const isSuccess = await new Promise((resolve) => {
      ftp.download(downloadArr, "/", (err) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    ftp.close();
    if (isSuccess) {
      await Promise.all(
        attachments.map((attachment) => {
          const fileType = getFileType(attachment.fileType);
          return watermark(watermarkPath + attachment.filePath, "temp/" + attachment.filePath, fileType);
        })
      ).catch((err) => logger.error(err));
    }
    return isSuccess;
  } else {
    return false;
  }
}

async function downloadAttachments(allAttachments, isWatermark) {
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isWatermark && isConnected && Attachment.isCompressed) {
    return await downloadAttachmentsWithWatermark(allAttachments);
  }
  if (isConnected) {
    ftp.connect(config);
    const attachments = _.filter(allAttachments, (at) => !fs.existsSync("temp/" + at.filePath));
    const downloadArr = attachments.map((att) => {
      return {
        remote: att.filePath,
        local: "temp" + att.filePath,
      };
    });
    const isSuccess = await new Promise((resolve) => {
      ftp.download(downloadArr, "/", (err) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    ftp.close();
    return isSuccess;
  }
  return false;
}

module.exports = {
  downloadAttachments,
  downloadAttachmentFromFtp,
  uploadAttachments,
  compressAttachment,
  uncompressAttachment,
};
