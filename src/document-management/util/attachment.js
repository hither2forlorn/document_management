const { Attachment } = require("../../config/database");
const { ftp, config, checkFtp } = require("../../config/filesystem");
const watermark = require("../../util/watermark");
const fs = require("fs");
const _ = require("lodash");
const fileserver = require("../../config/fileserver");
const { emptyTemp } = require("../../config/filesystem");
const logger = require("../../config/logger");
const { getHash } = require("../util/url");
const { handlePyhonExecution, tasks } = require("./pythonExecution");
const path = require("path");
const http = require("http");
const {
  handleOCRFile,
  handlePDFWatermark,
  handleTextPDFWatermark,
  handleDecryptFile,
  handleEncryptFile,
} = require("./pythonGlobalFunctions");
const { getAttachmentById, getDocument } = require("./getModelDetail");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { getBankObject, dms_features, includeThisFeature, banks, onlyForThisVendor } = require("../../config/selectVendor");
const EasyFtp = require("easy-ftp");
const { FTP } = require("../../config/credentials");
const archiver = require("archiver");
function getFileType(fileType) {
  if (fileType.includes("image")) {
    return "image";
  } else if (fileType.includes("pdf")) {
    return "pdf";
  } else {
    return "other";
  }
}

/**
 * Sends file path to the attachment general-dms-file-server
 * to compress the particular attachment
 * @method module:AttachmentModule#compressAttachment
 * @param {String} filePath
 * @returns Metadata to update the attachment in the database
 */
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

/**
 * download the file from the ftp to the temp folder
 *
 * @param {*} url
 */
const downlaodFile = async (url, colseWhenDone) => {
  const SERVER_URL = "https://localhost:443/api";
  const fileName = path.basename(url);
  const fileDestination = "temp/";
  const downloadRequest = http.get(SERVER_URL + url, (res) => {
    //  allows us to channel the information that we are getting from the request to any qriteable string.
    const fileStream = fs.createWriteStream(fileDestination + fileName);
    res.pipe(fileStream);

    //   error handeling
    fileStream.on("error", (err) => {
      console.log("Error in the filestream");
      console.log(err.message);
    });

    fileStream.on("close", () => {
      colseWhenDone(fileName);
    });

    //   closing the file stream once the download is finished \
    fileStream.on("finish", () => {
      //   close the file stream
      fileStream.close();
      console.log("file is downloaded sucessfully");
    });
  });

  downloadRequest.on("error", (err) => {
    console.log("Error in the filestream");
    console.log(err);
  });
};

/**
 * Function to download files from FTP server
 * @method module:AttachmentModule#downloadAttachmentFromFtp
 * @param {String} localPath
 * @param {String} ftpPath
 * @param {Number} attachId
 * @param {Boolean} dontWatermarkç
 * @param {Object} user
 */
async function downloadAttachmentFromFtp(localPath, ftpPath, attachId, dontWatermark, user) {
  let doc;
  if (attachId) doc = await getDocument(attachId, true);

  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  try {
    if (isConnected) {
      ftp.connect(config);
      const isSuccess = await new Promise((resolve) => {
        ftp.download(ftpPath, localPath, async (err) => {
          if (err) {
            logger.error(err);
            resolve(false);
          } else {
            let attach = await getAttachmentById(attachId);
            // Decrypt data  when Downloading
            if (typeof doc == "object" && attach.isEncrypted) {
              await handleDecryptFile({ local: localPath });
            }
            attach.localPath = localPath;
            attach.hasEncryption = typeof doc == "object" && doc[0]?.hasEncryption ? doc[0]?.hasEncryption : false;

            if (!dontWatermark) {
              await handleTextPDFWatermark(attach, user?.email || "", getBankObject().logo);
            }

            if (includeThisFeature(dms_features, includeThisFeature.EMPTY_TEMP_ON_DOWNLOAD)) {
              setTimeout(() => {
                emptyTemp();
              }, process.env.EMPTY_TEMP_DURATION || 30000);
            }

            resolve(true);
          }
        });
      });
      ftp.close();
      return isSuccess;
    } else {
      throw new Error("Cannot Downlaod- Please check ftp server");
      // return false;
    }
  } catch (e) {
    console.log("FTP ERROR - UNABLE TO DOWNLOAD ATTACHEMENT ");
    console.log(e.code, e.message);
  }
}

async function downloadAttachmentFromFtpZip(localPath, ftpPath, attachId, dontWatermark, user, customWatermarkValue) {
  let doc;
  if (attachId) doc = await getDocument(attachId, true);
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isConnected) {
    const config = {
      host: FTP.HOST,
      port: FTP.PORT,
      username: FTP.USERNAME,
      password: FTP.PASSWORD,
      type: FTP.TYPE,
    };
    ftp.connect(config);
    const isSuccess = await new Promise((resolve) => {
      ftp.download(ftpPath, localPath, async (err) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else {
          // Decrypt data when Downloading
          if (typeof doc == "object" && doc[0]?.hasEncryption) {
            await handleDecryptFile({ local: localPath });
          }
          let attach = await getAttachmentById(attachId);
          attach.localPath = localPath;
          attach.hasEncryption = typeof doc == "object" && doc[0]?.hasEncryption ? doc[0]?.hasEncryption : false;

          if (!dontWatermark) {
            let date = new Date().toLocaleDateString();
            await handleTextPDFWatermark(attach, user?.email || "", getBankObject().logo, date, customWatermarkValue);
            const fileType = getFileType(attach.fileType);
            // await watermark("./temp" + attach.filePath, "temp/" + attach.filePath, fileType, user);
          }

          // Wait for some time before zipping
          setTimeout(async () => {
            let newLocalPath = localPath.replace(/^((?:[^\/]+\/){3}).*/, "$1");
            if (fs.existsSync(newLocalPath) && fs.lstatSync(newLocalPath).isDirectory()) {
              const zipFileName = `${doc[0].otherTitle}.zip`.trim();
              const outputPath =
                "C:\\Gentech\\GDMS\\general-dms-api\\temp\\zip\\" + zipFileName || process.env.ZIP_FILE_PATH + zipFileName;
              const output = fs.createWriteStream(outputPath);
              const archive = archiver("zip", {
                zlib: { level: 9 },
              });

              output.on("close", () => {
                console.log(archive.pointer() + " total bytes");
                console.log("archiver has been finalized and the output file descriptor has closed.");
                resolve(true);
              });

              archive.on("warning", (err) => {
                if (err.code === "ENOENT") {
                  console.warn(err);
                } else {
                  throw err;
                }
              });

              archive.on("error", (err) => {
                throw err;
              });

              archive.pipe(output);
              archive.directory(newLocalPath, false);
              archive.finalize();
            } else {
              logger.error(error);
              console.error("Local path is not a directory.");
              resolve(false);
            }
          }, 10);
        }
      });
    });
    ftp.close();
    return isSuccess;
  } else {
    throw new Error("Cannot Download - Please check ftp server");
  }
}
/**
 * Function to upload files to FTP server
 * @method module:AttachmentModule#uploadAttachments
 * @param {Array<Object>} attachments
 */
async function uploadAttachments(attachments, res, req) {
  const doc = await getDocument(attachments[0].itemId);
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  // for log
  let log_query;

  // prepare array for local and ftp path
  const uploadArr = attachments.map((att) => {
    return {
      remote: att.filePath,
      local: att.localPath,
    };
  });

  // // Handle Quick OCR
  if (doc?.dataValues?.hasQuickQcr) {
    await Promise.all(
      attachments.map(async (att, index) => {
        //  local path of file- eg temp/file.pdf
        const output = await handleOCRFile(att);
        attachments[index].ocr = true;
        attachments[index].attachmentDescription = output?.substring(0, 4000);
      })
    );
  }
  // Force hasEncryption to true only for Everest
  const shouldEncrypt = onlyForThisVendor([banks.everest.name]) ? true : doc?.dataValues?.hasEncryption;

  if (shouldEncrypt) {
    await Promise.all(
      attachments.map(async (att) => {
        // local path of file, e.g., temp/file.pdf
        return await handleEncryptFile({
          remote: att.filePath,
          local: att.localPath,
        });
      })
    );
  }
  if (isConnected) {
    const ftp = new EasyFtp();
    const config = {
      host: FTP.HOST,
      port: FTP.PORT,
      username: FTP.USERNAME,
      password: FTP.PASSWORD,
      type: FTP.TYPE,
    };

    ftp.connect(config);

    const isSuccess = await new Promise((resolve) => {
      ftp.upload(uploadArr, "/", (err) => {
        if (err) {
          console.log(err);
          logger.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    if (isSuccess) {
      // To maintain log
      // const previousValue = await findPreviousData(constantLogType.ATTACHMENT, doc.id, req.method);
      const results = await Promise.all(
        attachments.map(async (attachment) => {
          const result = await Attachment.create(attachment, {
            logging: (sql) => (log_query = sql),
          });

          // For log
          // await createLog(req, constantLogType.ATTACHMENT, result.id, log_query, previousValue);
          return { ...result, dataValues: { ...result?.dataValues, documentIndex: attachment?.documentIndex } };
        })
      );
      ftp.close();
      return results;
    } else {
      console.log("ftp upload failed");
      return false;
    }
  } else {
    console.log("FTP not connected");
    res.status(500).send({ success: false, message: "Ftp Not connected" });
    return false;
  }
}

/**
 *  attachment upload for BPM
 *
 * @param {*} attachments
 * @param {*} apiUrl
 * @returns attachRes
 */
async function uploadAttachmentBPM(attachments, apiUrl) {
  let resData = {};
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isConnected) {
    ftp.connect(config);
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
    if (isSuccess) {
      const data = await Promise.all(
        attachments.map((attachment) => {
          // create attachment in dms
          return Attachment.create(attachment).then((res) => {
            return {
              ...res.dataValues,
              url: ipAddress || process.env.FRONTEND_URL + "#/BPM-special-preview?attachId=" + getHash(res.id),
            };
          });
        })
      );
      ftp.close();
      return data;
    } else {
      console.log("FTP not connected");
      return false;
    }
  }
}

/**
 * Method to download attachments with the watermark
 * @method module:AttachmentModule#downloadAttachmentsWithWatermark
 * @param {Array<Object>} allAttachments
 */
async function downloadAttachmentsWithWatermark(allAttachments) {
  const watermarkPath = "temp/watermark";
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isConnected) {
    ftp.connect(config);
    // const attachments = onlyForThisVendor(banks.rbb)
    // ? allAttachments
    // : _.filter(allAttachments, (at) => {
    //     const isExist = fs.existsSync("temp/" + at.filePath);
    //     return !isExist;
    //   });

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
      ftp.download(downloadArr, "/", async (err) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else {
          // atachment less
          if (attachments.length > 0) {
            const doc = await getDocument(attachments[0]?.id, true);
            if (typeof doc == "object" && doc[0]?.hasEncryption)
              await Promise.all(
                attachments.map(async (att) => {
                  const local = watermarkPath + att.filePath;
                  await handleDecryptFile({ local });
                })
              );
          }

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

/**
 * Method to download attachments from FTP with/without watermark
 * @method module:AttachmentModule#downloadAttachments
 * @param {Array<Object>} allAttachments
 * @param {Boolean} isWatermark
 *
 * When previewing document, it downlaod all available pictures
 */
async function downloadAttachments(allAttachments, isWatermark) {
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isWatermark && isConnected) {
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
      ftp.download(downloadArr, "/", async (err) => {
        if (err) {
          logger.error(err);
          resolve(false);
        } else {
          // atachment less
          if (attachments.length > 0) {
            const doc = await getDocument(attachments[0]?.id, true);

            if (typeof doc == "object" && doc[0]?.hasEncryption)
              await Promise.all(
                attachments.map(async (att) => {
                  const local = "temp" + att.filePath;
                  await handleDecryptFile({ local });
                })
              );
          }

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
  uploadAttachmentBPM,
  downloadAttachmentFromFtpZip,
};
