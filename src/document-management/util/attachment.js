const { Attachment } = require("../../config/database");
const { checkFtp, ftp } = require("../../config/filesystem");
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
  handleTextPDFWatermarkCustom,
} = require("./pythonGlobalFunctions");
const moment = require("moment");
const { getAttachmentById, getDocument } = require("./getModelDetail");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { getBankObject, dms_features, includeThisFeature } = require("../../config/selectVendor");
const EasyFtp = require("easy-ftp");
const { FTP } = require("../../config/credentials");
const attachment = require("../models/attachment");

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
  const SERVER_URL = "http://localhost:8181/api";
  const fileName = path.basename(url);
  const fileDestination = "temp/";
  const downloadRequest = http.get(SERVER_URL + url, (res) => {
    //  allows us to channel the information that we are getting from the request to any qriteable string.
    const fileStream = fs.createWriteStream(fileDestination + fileName);
    res.pipe(fileStream);

    //   error handeling
    fileStream.on("error", (err) => {
      console.log("Error in the filestream");
      console.log(err);
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
async function downloadAttachmentFromFtp(
  localPath,
  ftpPath,
  attachId,
  dontWatermark,
  user,
  customWatermarkID,
  isPreferredWatermark,
  userId,
  customWatermarkValue
) {
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
          // Decrypt data  when Downloading
          if (typeof doc == "object" && doc[0]?.hasEncryption) {
            await handleDecryptFile({ local: localPath });
          }
          let attach = await getAttachmentById(attachId);
          attach.localPath = localPath;
          attach.hasEncryption = typeof doc == "object" && doc[0]?.hasEncryption ? doc[0]?.hasEncryption : false;

          if (!dontWatermark) {
            let date = new Date().toLocaleDateString();
            if (includeThisFeature(dms_features.BASIC_WATERMARK)) {
              await handleTextPDFWatermark(
                attach,
                user?.email || "",
                getBankObject().logo,
                date,
                customWatermarkID,
                isPreferredWatermark,
                userId,
                customWatermarkValue
              );
            } else {
              await handleTextPDFWatermarkCustom(
                attach,
                user?.email || "",
                getBankObject().logo,
                date,
                customWatermarkID,
                isPreferredWatermark,
                userId,
                customWatermarkValue
              );
            }

            const fileType = getFileType(attach.fileType);
            await watermark("./temp" + attach.filePath, "temp/" + attach.filePath, fileType, user);
          }

          // if (includeThisFeature(dms_features.EMPTY_TEMP_ON_DOWNLOAD)) {
          //   setTimeout(() => {
          //     emptyTemp();
          //   }, process.env.EMPTY_TEMP_DURATION || 30000);
          // }

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
}

/**
 * Function to upload files to FTP server
 * @method module:AttachmentModule#uploadAttachments
 * @param {Array<Object>} attachments
 */
async function uploadAttachments(attachments, res, req, archived) {
  const doc = await getDocument(attachments[0].itemId);
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  let log_query;

  // FTP configuration
  const config = {
    host: FTP.HOST,
    port: FTP.PORT,
    username: FTP.USERNAME,
    password: FTP.PASSWORD,
    type: FTP.TYPE,
  };

  let attachmentIds = [];

  for (const attachment of attachments) {
    // Check if any previous versions of the attachment exist (same itemId, name, both deleted and non-deleted)
    let existingAttachments = await Attachment.findAll({
      where: {
        itemId: attachment.itemId,
        name: attachment.name,
      },
      order: [['updatedAt', 'DESC']], // Sort by 'updatedAt' in descending order to get the latest one
    });

    // Set the file path where the attachment should be saved
    const baseFilePath = `/Citizenship/document/${attachment.itemId}`; // The directory where files are stored
    const baseFileName = attachment.name.split('.')[0];
    const extension = attachment.name.split('.').pop();

    let updatedFilePath = `${baseFilePath}/${attachment.name}`; // Default new file path
    let updatedDateTime = moment(); // Initialize as current time (in case no previous attachment exists)

    // If there are existing attachments (both deleted and non-deleted), handle versioning
    if (existingAttachments.length > 0) {
      const latestAttachment = existingAttachments[0]; // Get the most recently updated version

      if (!archived) {
        // Check if there's an existing attachment with the same name and itemId, and mark it as deleted
        if (latestAttachment.isDeleted !== 1) {
          await Attachment.update(
            { isDeleted: 1 },
            { where: { id: latestAttachment.id } }
          );
        }

        // Use the updatedAt field from the most recent attachment (deleted or non-deleted)
        updatedDateTime = moment(latestAttachment.updatedAt); // Convert to moment object

        // Create versioned name for the new file (based on the updatedAt of the previous version)
        const updatedVersionedName = `${baseFileName}__version_${updatedDateTime.format('YYYY-MM-DD-HH-mm-ss')}.${extension}`;
        const updatedVersionedFilePath = `${baseFilePath}/${updatedVersionedName}`; // Versioned file path

        updatedFilePath = updatedVersionedFilePath;
        updatedUrl = updatedFilePath; // Same path used for URL in this case

        // Correct the local path for where files are actually stored
        const baseLocalPath = process.env.FILE_SERVER_LOCAL_BASE_PATH;
        const currentFilePath = path.join(baseLocalPath, latestAttachment.filePath); // Full path of the current file
        const newFilePath = path.join(baseLocalPath, updatedVersionedFilePath);// Full path for the renamed file
        if (fs.existsSync(currentFilePath)) {
          try {
            fs.renameSync(currentFilePath, newFilePath);

            await Attachment.update(
              {
                filePath: updatedVersionedFilePath, // Update the file path
                url: updatedVersionedFilePath,
              },
              { where: { id: latestAttachment.id } } // Update the previous (old) attachment
            );
          } catch (err) {
            console.error("Error renaming file locally:", err);
          }
        } else {
          console.error(`File does not exist: ${currentFilePath}`);
        }
      }
    }

    // If not archived, create a new attachment
    if (!archived) {
      const newFilePath = `${baseFilePath}/${attachment.name}`; // Save new file directly to Citizenship folder
      const newAttachment = await Attachment.create(
        { ...attachment, url: newFilePath, updatedDate: updatedDateTime.format('YYYY-MM-DD HH:mm:ss') },
        {
          logging: (sql) => (log_query = sql),
        }
      );
      attachmentIds.push(newAttachment.id); // Collect the newly created attachment ID

      const previousValue = await findPreviousData(constantLogType.ATTACHMENT, doc.id, req.method);
      await createLog(req, constantLogType.ATTACHMENT, newAttachment.id, log_query, previousValue);
      // Handle OCR
      if (doc.dataValues.hasQuickQcr) {
        await Promise.all(
          attachments.map(async (att, index) => {
            const output = await handleOCRFile(att);
            // Update attachment with OCR result
            attachments[index].ocr = true;
            attachments[index].attachmentDescription = output?.substring(0, 4000);

            // Update the Attachment table with OCR details
            await Attachment.update(
              {
                ocr: true,
                attachmentDescription: attachments[index].attachmentDescription,
              },
              { where: { id: newAttachment.id } }
            );
          })
        );
      }

      // Handle encryption
      if (doc.dataValues.hasEncryption) {
        await Promise.all(
          attachments.map(async (att) => {
            const encryptedOutput = await handleEncryptFile({
              remote: att.filePath,
              local: att.localPath,
            });

            // Update Attachment table to mark the file as encrypted (you can modify this part based on your requirements)
            await Attachment.update(
              {
                isEncrypted: true, // Assuming there's an 'isEncrypted' column
                encryptedFilePath: encryptedOutput?.filePath, // Assuming the encrypted file path needs to be stored
              },
              { where: { id: newAttachment.id } }
            );
          })
        );
      }
      await Attachment.update(
        { isDeleted: 0 },
        { where: { id: newAttachment.id } }
      );
    }
  }

  // FTP Upload
  const uploadArr = attachments.map((att) => ({
    remote: att.filePath,
    local: att.localPath,
  }));

  if (isConnected) {
    const ftp = new EasyFtp();
    ftp.connect(config);

    const isSuccess = await new Promise((resolve) => {
      ftp.upload(uploadArr, "/", (err) => {
        ftp.close();
        if (err) {
          console.log(err);
          logger.error(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    if (!isSuccess) {
      console.log("FTP upload failed");
      return false;
    }
  } else {
    console.log("FTP not connected");
    res.status(500).send({ success: false, message: "FTP not connected" });
    return false;
  }

  return attachmentIds;
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
    const ftp = new EasyFtp();
    const config = {
      host: FTP.HOST,
      port: FTP.PORT,
      username: FTP.USERNAME,
      password: FTP.PASSWORD,
      type: FTP.TYPE,
    };
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
async function downloadAttachmentsWithWatermark(allAttachments, user) {
  const watermarkPath = "temp/watermark";
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
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

    const attachments = allAttachments;

    // to use cache use this
    // const attachments = _?.filter(allAttachments, (at) => {
    //   const isExist = fs.existsSync("temp/" + at.filePath);
    //   return !isExist;
    // });

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
          return watermark(watermarkPath + attachment.filePath, "temp/" + attachment.filePath, fileType, user);
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
async function downloadAttachments(allAttachments, isWatermark, user) {
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (isWatermark && isConnected) {
    return await downloadAttachmentsWithWatermark(allAttachments, user);
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

    const attachments = _?.filter(allAttachments, (at) => !fs.existsSync("temp/" + at.filePath));

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
};
