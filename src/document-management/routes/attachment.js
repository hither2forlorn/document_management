/**
 * @module AttachmentModule
 */

const router = require("express").Router();
const multer = require("multer");
const moment = require("moment");
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { Op } = require("sequelize");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");
const { deleteItem, ATTACHMENT, deleteItemWithId } = require("../../config/delete");
const { storage, checkFtp } = require("../../config/filesystem");
const attachment = require("../models/attachment");
const { indexOf, lastIndexOf, forEach } = require("lodash");
const {
  Document,
  Attachment,
  DocumentIndexValue,
  Tag,
  DocumentTypeIndex,
  sequelize,
  HourlyAccess,
  MultipleHierarchies,
} = require("../../config/database");
const { uploadAttachment } = require("../util/bulk_upload");
const Sequelize = require("sequelize");
const {
  uploadAttachments,
  downloadAttachmentFromFtp,
  uncompressAttachment,
  uploadAttachmentBPM,
  downloadAttachmentFromFtpZip,
} = require("../util/attachment");
const { onlyForThisVendor, banks } = require("../../config/selectVendor");
const { paginateQuery } = require("../util/attachmentPaginate");
const { convertDate } = require("../../util/converDate");
const { singleAttachment } = require("../sqlQuery/attachmentQuery");
const { associatedBokIdFromTags } = require("../sqlQuery/attachment");

const { getDocument } = require("../util/getModelDetail");

const { addChecker } = require("../util/checker");
const { pyFTPocrFile, handleEncryptFile } = require("../util/pythonGlobalFunctions");
const { addUserAccess } = require("../security-level");
const { createLog, constantLogType } = require("../../util/logsManagement");
const { execUpdateQery, execSelectQuery } = require("../../util/queryFunction");
const { getId } = require("../util/url");
const { edit_delete_document, validateUserIsInSameDomain } = require("../middleware/edit_delete_document");
const { DOCUMENT_INDICES } = require("../util/constants");
const { consoleLog } = require("../../util");
async function checkCompressing(attachment) {
  if (attachment.isCompressed) {
    const fileInfo = await uncompressAttachment(attachment.filePath);
    await Attachment.update(
      {
        isCompressed: false,
        filePath: fileInfo.filePath,
        size: fileInfo.size,
      },
      { where: { id: attachment.id } }
    );
    return fileInfo.filePath;
  } else {
    return attachment.filePath;
  }
}

router.get("/attachment/pagination", auth.required, async (req, res, next) => {
  req.query.userId = req.payload.id;

  try {
    const paginationDocument = await sequelize.query(paginateQuery(req.query, false, req.payload), {
      type: Sequelize.QueryTypes.SELECT,
    });
    const totalDocument = await sequelize.query(paginateQuery(req.query, true, req.payload), {
      type: Sequelize.QueryTypes.SELECT,
    });
    res.send({
      resp: paginationDocument,
      total: totalDocument[0]?.total,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
  }
});

router.post("/attachment", auth.required, async (req, res, next) => {
  const createdBy = req.payload.id;

  const upload = multer({ storage: storage }).array("file");
  upload(req, res, async function (err) {
    const indexValues = req.body.indexValues ? JSON.parse(req.body.indexValues) : [];
    const associatedIDS = req.body.associatedIds ? JSON.parse(req.body.associatedIds) : [];

    if (err) {
      logger.error(err);
      res.status(500).send({ success: false, message: err?.message || "Error" });
    } else {
      const files = req.files;
      const { itemId, itemType, attachmentDesc, redaction, customerName, url, documentTypeId, approvedDate, notes } =
        req.body;

      // validate user is in same domain
      const message = await validateUserIsInSameDomain(req.payload, itemId);
      if (message) return res.send({ success: false, message });

      const doc = await getDocument(itemId);
      const attachments = [];
      let exit = false;

      const isCheckerProcess = await execSelectQuery(`
      select * from approval_masters am
      where documentId = ${itemId}`);
      // restrict invalid file types
      const invalidFileTypes = [
        "application/x-ms-dos-executable", //.exe file
        "application/x-msdownload",
        "application/octet-stream", //.bat file
        "application/zip", // zip files
      ];

      files.forEach((file) => {
        const fileSize = file.size / 1024;
        const maxFileSize = process.env.FILE_SIZE || 51200;
        const attachment = {
          name: file.originalname,
          attachmentDescription: attachmentDesc,
          fileType: file.mimetype,
          size: fileSize,
          isEncrypted: onlyForThisVendor([banks.everest.name]) ? true :
          doc.dataValues.hasEncryption || false,
          // redaction: JSON.parse(redaction) || false,
          filePath: "/" + itemType + "/" + itemId + "/" + Date.now() + "-" + file.originalname,
          localPath: file.path,
          itemId: itemId,
          ...(itemType ? { itemType } : {}),
          attachmentType: "normal-upload",
          isDeleted: false,
          pendingApproval:
            req.body.isNewApprovedDocumentAttachment === "true"
              ? true
              : !doc.dataValues.isApproved && isCheckerProcess.length > 0
              ? true
              : false,
          documentTypeId,
          customerName,
          url,
          approvedDate: convertDate(approvedDate),
          createdBy,
          notes,
        };

        if (doc.documentTypeId === 1 || doc.documentTypeId === 2) {
          let docIdFromUser = parseInt(attachment.documentTypeId); // obtained from index selection
          let docTypeFromUser = file.originalname.toString().substring(14).split(".")[0]; // obtained from attachment
          let acutalDocType = DOCUMENT_INDICES.find((row) => row.id == docIdFromUser).key; // obtained by matching DOCUMENT_INDICES constants with index selected values
          let accountNumber = file.originalname.toString().substring(0, 14);
          let regexOnlyAlphabets = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
          let isValid = regexOnlyAlphabets.test(accountNumber);
          if (isValid) {
            exit = true;
            res.status(412).send({ message: "ONLY 14 DIGITS STRING IS ALLOWED AS ACCOUNT NUMBER" });
          }

          let regex = /\d+/g;
          let docTypeIntFromUser = docTypeFromUser.match(regex);

          // Allow numbers from 0 to 100 in all document types
          let numList = Array.from({ length: 101 }, (_, i) => i); // [0, 1, ..., 100]
          let num = docTypeIntFromUser ? numList.find((row) => row == docTypeIntFromUser[0]) : null;

          if (num !== undefined && docTypeFromUser.toString().includes(num)) {
            exit = false;
            acutalDocType = docTypeFromUser;
          }

          //allows numbers in document types
          // let regex = /\d+/g;
          // let docTypeIntFromUser = docTypeFromUser.match(regex);
          // let num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].find((row) => row == docTypeIntFromUser);
          // if (docTypeFromUser.toString().includes(num)) {
          //   exit = false;
          //   acutalDocType = docTypeFromUser;
          // }

          //check docType like AOF, CIF with actualDocType,
          //actualDocType is obtained by matching id that users choose from gui document type dropdown.
          if (docTypeFromUser !== acutalDocType) {
            exit = true;
            res.status(412).send({ message: `INDEX MISMATCH ! MUST BE EXACT TO ${accountNumber}${acutalDocType}.PDF` });
          }
        }

        // File type validation
        if (invalidFileTypes.includes(attachment.fileType) && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({ success: false, message: "Invalid File Type", success: false });
        }

        // file size limitation
        if (fileSize >= maxFileSize && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({
            message: "File size exced limit is " + maxFileSize + " MB",
            success: false,
          });
        }
        return attachments.push(attachment);
      });

      // exit  for validation
      if (exit) return;
      uploadAttachments(attachments, res, req)
        .then(async (success, failure) => {
          if (failure || !success) {
            return res.status(500).send("Error");
          } else {
            if (typeof success == "object" && success?.length > 0) {
              success.map((attachment) => {
                const attachmentId = attachment?.dataValues?.id;
                if (attachmentId) {
                  // add indexes to attachment
                  Promise.all(
                    indexValues.map((item) => {
                      console.log(item, JSON.parse(item.value), typeof item);
                      DocumentIndexValue.create({
                        ...item,
                        documentId: itemId,
                        value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,
                        attachmentId: attachmentId,
                      }).catch((err) => {
                        console.log(err);
                        throw new Error("Whoops! Index");
                      });
                    })
                  );

                  // create Tags
                  // Promise.all(
                  //   associatedIDS.map(async (tag) => {
                  //     Tag.create({
                  //       ...tag,
                  //       attachId: attachmentId,
                  //       label: "tag",
                  //       docId: itemId,
                  //       documentTypeId,
                  //     }).catch((err) => {
                  //       console.log(err);
                  //       throw new Error("Whoops! tags");
                  //     });
                  //   })
                  // );
                }
              });
            }
            // res.send({
            //   data: attachments,
            //   success: true,
            //   message: "Successfully uploaded",
            // });

            res.send({
              data: success.map((successItem, index) => ({
                attachmentId: successItem?.dataValues?.id,
                ...attachments[index],
              })),

              success: true,
              message: "Successfully uploaded",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Error while uploading !! Rolling back " });
          return;
        });
    }
  });
});

router.post("/attachment-cifOld", auth.required, async (req, res, next) => {
  const createdBy = req.payload.id;

  const upload = multer({ storage: storage }).array("file");
  upload(req, res, async function (err) {
    const indexValues = req.body.indexValues ? JSON.parse(req.body.indexValues) : [];
    const associatedIDS = req.body.associatedIds ? JSON.parse(req.body.associatedIds) : [];
    if (err) {
      console.log(err);
      logger.error(err);
      res.status(500).send({ success: false, message: err?.message || "Error" });
    } else {
      const files = req.files;
      const { itemId, itemType, attachmentDesc, redaction, customerName, url, documentTypeId, approvedDate, notes } =
        req.body;
      const fileNames = files.map((file) => file.originalname);
      const query = `
        SELECT name FROM attachments
        WHERE name IN (${fileNames.map((name) => `'${name}'`).join(",")})
        AND itemId = ${itemId}
        AND isDeleted = 0
      `;

      // Check if any of these file names already exist in the database
      const existingAttachments = await execSelectQuery(query);
      if (existingAttachments.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Attachments with names ${existingAttachments.map((att) => att.name).join(", ")} already exist.`,
        });
      }
      let cifNumber = fileNames.toString().substring(0, 9);
      let regexOnlyNumbers = /^\d{9}$/; // Ensures exactly 9 digits at the start

      let isValid = regexOnlyNumbers.test(cifNumber);
      if (!isValid) {
        res.status(412).send({ message: "ONLY 9 DIGITS NUMBER IS ALLOWED AS CIF" });
      }

      // validate user is in same domain
      const message = await validateUserIsInSameDomain(req.payload, itemId);
      if (message) return res.send({ success: false, message });

      const doc = await getDocument(itemId);
      const attachments = [];
      let exit = false;

      const isCheckerProcess = await execSelectQuery(`
      select * from approval_masters am
      where documentId = ${itemId}`);
      // restrict invalid file types
      const invalidFileTypes = [
        "application/x-ms-dos-executable", //.exe file
        "application/x-msdownload",
        "application/octet-stream", //.bat file
        "application/zip", // zip files
      ];

      files.forEach((file) => {
        const fileSize = file.size / 1024;
        const maxFileSize = process.env.FILE_SIZE || 51200;
        const attachment = {
          name: file.originalname,
          attachmentDescription: attachmentDesc,
          fileType: file.mimetype,
          size: fileSize,
          isEncrypted: doc.dataValues.hasEncryption || false,
          // redaction: JSON.parse(redaction) || false,
          filePath: "/" + itemType + "/" + itemId + "/" + Date.now() + "-" + file.originalname,
          localPath: file.path,
          itemId: itemId,
          ...(itemType ? { itemType } : {}),
          attachmentType: "normal-upload",
          isDeleted: false,
          // pendingApproval: createdBy === 1 ? 0 : isCheckerProcess.length > 0 || doc.dataValues.isApproved ? true : false,
          pendingApproval: false,
          documentTypeId,
          customerName,
          url,
          approvedDate: convertDate(approvedDate),
          createdBy,
          notes,
        };

        // File type validation
        if (invalidFileTypes.includes(attachment.fileType) && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({ success: false, message: "Invalid File Type", success: false });
        }

        // file size limitation
        if (fileSize >= maxFileSize && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({
            message: "File size exced limit is " + maxFileSize + " MB",
            success: false,
          });
        }
        return attachments.push(attachment);
      });

      // exit  for validation
      if (exit) return;
      uploadAttachments(attachments, res, req)
        .then(async (success, failure) => {
          if (failure || !success) {
            return res.status(500).send("Error");
          } else {
            if (typeof success == "object" && success?.length > 0) {
              success.map((attachment) => {
                const attachmentId = attachment?.dataValues?.id;
                if (attachmentId) {
                  // add indexes to attachment
                  Promise.all(
                    indexValues.map((item) => {
                      console.log(item, JSON.parse(item.value), typeof item);
                      DocumentIndexValue.create({
                        ...item,
                        documentId: itemId,
                        value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,
                        attachmentId: attachmentId,
                      }).catch((err) => {
                        console.log(err);
                        throw new Error("Whoops! Index");
                      });
                    })
                  );

                  // create Tags
                  // Promise.all(
                  //   associatedIDS.map(async (tag) => {
                  //     Tag.create({
                  //       ...tag,
                  //       attachId: attachmentId,
                  //       label: "tag",
                  //       docId: itemId,
                  //       documentTypeId,
                  //     }).catch((err) => {
                  //       console.log(err);
                  //       throw new Error("Whoops! tags");
                  //     });
                  //   })
                  // );
                }
              });
            }
            // res.send({
            //   data: attachments,
            //   success: true,
            //   message: "Successfully uploaded",
            // });

            res.send({
              data: success.map((successItem, index) => ({
                attachmentId: successItem?.dataValues?.id,
                ...attachments[index],
              })),

              success: true,
              message: "Successfully uploaded",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Error while uploading !! Rolling back " });
          return;
        });
    }
  });
});

router.post("/attachment-cif", auth.required, async (req, res, next) => {
  const createdBy = req.payload.id;

  const upload = multer({ storage: storage }).array("file");
  upload(req, res, async function (err) {
    const indexValues = req.body.indexValues ? JSON.parse(req.body.indexValues) : [];
    const associatedIDS = req.body.associatedIds ? JSON.parse(req.body.associatedIds) : [];
    if (err) {
      console.log(err);
      logger.error(err);
      res.status(500).send({ success: false, message: err?.message || "Error" });
    } else {
      const files = req.files;
      const { itemId, itemType, attachmentDesc, redaction, customerName, url, documentTypeId, approvedDate, notes } =
        req.body;
      const fileNames = files.map((file) => file.originalname);
      const cifId = fileNames.map((fileName) => fileName.slice(0, 9));

      const checkDocumentQuery = `
             SELECT id FROM documents WHERE id = ${itemId} AND isDeleted = 0
`;
      const existingDocument = await execSelectQuery(checkDocumentQuery);

      if (existingDocument.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No document found with the provided itemId.",
        });
      }

      const checkCifQuery = `SELECT
        div.id AS documentIndexValueId,
        div.documentId,
        div.documentIndexId,
        div.value,
        div.isDeleted AS documentIndexValueIsDeleted,
        doc.name AS documentName,
        doc.description AS documentDescription
        FROM
        document_index_values div
      INNER JOIN
        documents doc
        ON div.documentId = doc.id
      WHERE
        div.value = '${cifId[0]}'
        AND doc.isDeleted = 0
      AND (div.documentIndexId = 2 OR div.documentIndexId = 8)`;

      const document = await execSelectQuery(checkCifQuery);

      if (document.length === 0)
        return res.json({ success: false, message: "Unable to upload rename your file to correct CIF" });

      if (document.some((doc) => doc.documentId != itemId))
        return res.json({ success: false, message: "CIF must be of same documentId" });

      const query = `
        SELECT name FROM attachments
        WHERE name IN (${fileNames.map((name) => `'${name}'`).join(",")})
        AND itemId = ${itemId}
        AND isDeleted = 0
      `;

      // Check if any of these file names already exist in the database
      const existingAttachments = await execSelectQuery(query);
      if (existingAttachments.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Attachments with names ${existingAttachments.map((att) => att.name).join(", ")} already exist.`,
        });
      }
      let cifNumber = fileNames.toString().substring(0, 9);
      let regexOnlyNumbers = /^\d{9}$/; // Ensures exactly 9 digits at the start

      let isValid = regexOnlyNumbers.test(cifNumber);
      if (!isValid) {
        res.status(412).send({ message: "ONLY 9 DIGITS NUMBER IS ALLOWED AS CIF" });
      }

      // validate user is in same domain
      const message = await validateUserIsInSameDomain(req.payload, itemId);
      if (message) return res.send({ success: false, message });

      const doc = await getDocument(itemId);
      const attachments = [];
      let exit = false;

      const isCheckerProcess = await execSelectQuery(`
      select * from approval_masters am
      where documentId = ${itemId}`);
      // restrict invalid file types
      const invalidFileTypes = [
        "application/x-ms-dos-executable", //.exe file
        "application/x-msdownload",
        "application/octet-stream", //.bat file
        "application/zip", // zip files
      ];

      files.forEach((file) => {
        const fileSize = file.size / 1024;
        const maxFileSize = process.env.FILE_SIZE || 51200;
        const attachment = {
          name: file.originalname,
          attachmentDescription: attachmentDesc,
          fileType: file.mimetype,
          size: fileSize,
          isEncrypted: doc.dataValues.hasEncryption || false,
          // redaction: JSON.parse(redaction) || false,
          filePath: "/" + itemType + "/" + itemId + "/" + Date.now() + "-" + file.originalname,
          localPath: file.path,
          itemId: itemId,
          ...(itemType ? { itemType } : {}),
          attachmentType: "normal-upload",
          isDeleted: false,
          // pendingApproval: createdBy === 1 ? 0 : isCheckerProcess.length > 0 || doc.dataValues.isApproved ? true : false,
          pendingApproval: false,
          documentTypeId,
          customerName,
          url,
          approvedDate: convertDate(approvedDate),
          createdBy,
          notes,
        };

        // File type validation
        if (invalidFileTypes.includes(attachment.fileType) && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({ success: false, message: "Invalid File Type", success: false });
        }

        // file size limitation
        if (fileSize >= maxFileSize && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({
            message: "File size exced limit is " + maxFileSize + " MB",
            success: false,
          });
        }
        return attachments.push(attachment);
      });

      // exit  for validation
      if (exit) return;
      uploadAttachments(attachments, res, req)
        .then(async (success, failure) => {
          if (failure || !success) {
            return res.status(500).send("Error");
          } else {
            if (typeof success == "object" && success?.length > 0) {
              success.map((attachment) => {
                const attachmentId = attachment?.dataValues?.id;
                if (attachmentId) {
                  // add indexes to attachment
                  Promise.all(
                    indexValues.map((item) => {
                      console.log(item, JSON.parse(item.value), typeof item);
                      DocumentIndexValue.create({
                        ...item,
                        documentId: itemId,
                        value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,
                        attachmentId: attachmentId,
                      }).catch((err) => {
                        console.log(err);
                        throw new Error("Whoops! Index");
                      });
                    })
                  );

                  // create Tags
                  // Promise.all(
                  //   associatedIDS.map(async (tag) => {
                  //     Tag.create({
                  //       ...tag,
                  //       attachId: attachmentId,
                  //       label: "tag",
                  //       docId: itemId,
                  //       documentTypeId,
                  //     }).catch((err) => {
                  //       console.log(err);
                  //       throw new Error("Whoops! tags");
                  //     });
                  //   })
                  // );
                }
              });
            }
            // res.send({
            //   data: attachments,
            //   success: true,
            //   message: "Successfully uploaded",
            // });

            res.send({
              data: success.map((successItem, index) => ({
                attachmentId: successItem?.dataValues?.id,
                ...attachments[index],
              })),

              success: true,
              message: "Successfully uploaded",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Error while uploading !! Rolling back " });
          return;
        });
    }
  });
});

//update attachment
router.put("/attachment/:id", auth.required, async (req, res, next) => {
  const { id } = req.params;
  const upload = multer({ storage: storage }).array("file");
  upload(req, res, async function (err) {
    const { attachmentId, associatedIds, itemId, documentTypeId, notes } = req.body;
    var indexValues = JSON.parse(req.body.indexValues);
    indexValues = indexValues.filter((row) => row.documentIndexId);

    // update attachment notes
    await Attachment.update({ notes: notes }, { where: { id: attachmentId } });

    // update indexes or create new ones for new attributes
    Promise.all(
      indexValues.map(async (item) => {
        if (item?.documentIndexValueId) {
          await DocumentIndexValue.update(
            {
              ...item,
              value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,
            },
            {
              where: { id: item.documentIndexValueId },
            }
          );
        } else {
          await DocumentIndexValue.create({
            ...item,
            documentId: itemId,
            value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,

            attachmentId,
          });
        }
      })
    );

    if (associatedIds) {
      const tags = JSON.parse(associatedIds);

      await Tag.destroy({
        where: {
          docId: itemId,
          attachId: attachmentId,
        },
      });

      // add all tags
      Promise.all(
        tags.map((tag) => {
          Tag.create({
            ...tag,
            attachId: attachmentId,
            docId: itemId,
            label: "tag",
            documentTypeId,
          }).catch((e) => {
            throw new e();
          });
        })
      );
    }
  });
  res.send({ message: "updated successfully", success: true });
});

router.get("/attachment/download-bulk/:id/:cw", auth.required, async (req, res, next) => {
  console.log("route hit here");
  const cw = req.params.cw;
  // To maintain log
  let log_query;
  // Array to store file paths of downloaded attachments
  const downloadedFilePaths = [];

  try {
    // Fetch all attachment IDs related to the specified item ID
    const getAttachmentIds = await Attachment.findAll({
      where: {
        itemId: req.params.id,
      },
      raw: true,
      attributes: ["id"],
    });

    // Check if any attachments are found
    if (getAttachmentIds.length === 0) {
      return res.json({ success: false, message: "No attachments found for the specified item ID" });
    }

    // Iterate over each attachment ID and download them
    for (const attachment of getAttachmentIds) {
      const attachmentId = attachment.id;
      // Fetch attachment details
      const attachmentDetails = await Attachment.findOne({
        logging: (sql) => (log_query = sql),
        where: { id: attachmentId },
      });

      // Perform necessary processing (e.g., check compressing, etc.)
      const filePath = await checkCompressing(attachmentDetails);

      // Download attachment from FTP
      const isSuccessful = await downloadAttachmentFromFtpZip(
        "temp" + filePath,
        filePath,
        attachmentId,
        false,
        req.payload,
        cw
      );

      if (isSuccessful) {
        // Log successful download
        await createLog(req, constantLogType.ATTACHMENT, attachmentId, log_query);
        // Store downloaded file path
        downloadedFilePaths.push(filePath);
      } else {
        // Log download error
        logger.error(`Error downloading attachment with ID ${attachmentId}`);
      }
    }

    // Create a zip file
    const zipFileName = "attachments.zip";
    const zipFilePath = `./${zipFileName}`;
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level
    });

    output.on("close", () => {
      console.log(archive.pointer() + " total bytes");
      console.log("archiver has been finalized and the output file descriptor has closed.");
      // Send the zip file as response
      res.download(zipFilePath, zipFileName, (err) => {
        // Clean up zip file after download
        fs.unlinkSync(zipFilePath);
      });
    });

    archive.on("error", (err) => {
      throw err;
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add downloaded files to the zip archive
    for (const filePath of downloadedFilePaths) {
      archive.file(filePath, { name: filePath });
    }

    // Finalize the archive
    await archive.finalize();
    res.json({ success: true });
  } catch (err) {
    // Handle errors
    logger.error(err);
    res.json({ success: false, message: "Error downloading attachments" });
  }
});

// add document index
router.post("/parent-document-index/:id", auth.required, (req, res, next) => {
  const createdBy = req.payload.id;
  const upload = multer({ storage: storage }).array("file");
  upload(req, res, function (err) {
    const { itemId, documentType, documentTypeId } = req.body;
    const indexValues = JSON.parse(req.body.indexValues);
    const associatedIDS = JSON.parse(req.body.associatedIds);
    console.log(documentType, itemId);
    try {
      Attachment.create({
        name: "NoAttach-" + documentType,
        attachmentDescription: undefined,
        fileType: "parent",
        size: 0,
        redaction: false,
        filePath: "",
        localPath: "",
        itemId: itemId,
        itemType: "document",
        attachmentType: "normal-upload",
        isDeleted: false,
        documentTypeId: documentTypeId,
        customerName: "",
        url: "",
        approvedDate: null,
        createdBy: 1,
      })
        .then((attachment) => {
          // add indexes to attachment
          Promise.all(
            indexValues.map((item) => {
              DocumentIndexValue.create({
                ...item,
                documentId: itemId,
                value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,
                attachmentId: attachment.dataValues.id,
              }).catch((err) => {
                console.log(error);
                throw new Error("Whoops! Index");
              });
            })
          );

          // create Tags
          Promise.all(
            associatedIDS.map(async (tag) => {
              Tag.create({
                ...tag,
                attachId: attachment.dataValues.id,
                label: "tag",
                docId: itemId,
                documentTypeId,
              }).catch((err) => {
                throw new Error("Whoops! tags");
              });
            })
          );
        })
        .catch((err) => {
          throw new Error("Whoops! Attachment");
        });
      res.send({ success: true, message: "Successfully Indexed" });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Doucmnet index not created ", success: false });
    }
  });
});

/**
 * edit attachment with associated idk
 */
router.put("/attachment-index/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  // console.log("data in index value =>>>", id, req.payload.indexValues);

  // const t = await sequelize.transaction();t
  try {
    // delete tags
    deleteItemWithId(
      Tag,
      {
        id: id,
        type: ATTACHMENT,
      },
      req.payload,
      (response) => {
        res.send(response);
      },
      "attachId"
    );

    // add all tags
    Promise.all(
      tags.map((tag) => {
        Tag.create({
          ...tag,
          attachId: attachmentId,
          docId: itemId,
          label: "tag",
          documentTypeId,
        }).catch((e) => {
          throw new e();
        });
      })
    );
  } catch (error) {
    console.log("error", error);
  }
  // Tag.delete
});

router.post("/attachment/bulk-upload", auth.required, (req, res, next) => {
  const upload = multer({ storage: storage }).array("file");
  upload(req, res, async function (err) {
    if (err) {
      res.status(500).send("Error!");
    } else {
      const files = req.files;
      const itemType = req.body.itemType;
      const document = JSON.parse(req.body.document);
      const attachments = [];
      for (file of files) {
        document.isApproved = true;
        document.otherTitle = file.originalname;
        document.description = file.originalname + " - " + file.mimetype;
        document.ownerId = req.payload.id;
        document.createdBy = req.payload.id;
        document.branchId = req.payload?.branchId || "";
        document.departmentId = document.departmentId || req.payload?.departmentId || "";

        document.identifier = moment().format("YYY-MM-DD") + "-" + Date.now();

        const doc = await Document.create(document);
        const attachment = {
          name: file.originalname,
          fileType: file.mimetype,
          size: file.size / 1024,
          filePath: "/" + itemType + "/" + doc.id + "/" + Date.now() + "-" + file.originalname,
          localPath: file.path,
          itemId: doc.id,
          attachmentType: "bulk-upload",
          isDeleted: false,
        };
        attachments.push(attachment);
      }
      uploadAttachments(attachments)
        .then((success, failure) => {
          if (failure) {
            res.status(500).send("Error");
          } else {
            res.send("Success");
          }
        })
        .catch((err) => {
          res.status(500).send("Error");
        });
    }
  });
});

const logToFile = (message) => {
  const logFilePath = path.join(__dirname, "body.txt"); // Change 'logs.txt' to your desired log file name
  const logMessage = `${new Date().toISOString()}: ${message}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error("Failed to write to log file:", err);
  });
};

// Bulkupload used
router.post("/attachment/bulk-attachment-upload", auth.required, async (req, res, next) => {
  const selectedFiles = req.body.selectedFiles;
  const itemType = req.body.itemType || "document";

  // validation for duplicate entries
  // ===================================================
  let exit = false;

  await Promise.all(
    selectedFiles.map(async (file) => {
      let document = file.document;

      const dupliacteDoc = await Document.findOne({
        where: { otherTitle: document.otherTitle, documentTypeId: document.documentTypeId },
        raw: true,
      });
      if (dupliacteDoc) {
        const attachments = await Attachment.findAll({
          where: { itemId: dupliacteDoc.id },
          raw: true,
        });
        exit = true;
        logger.error(dupliacteDoc);
        console.log("Duplicate Attachment Found !");
      }
    })
  );

  if (exit) {
    return res.send("Duplicate doc or no attachment! ");
  }

  // ===================================================
  console.log("Uploaded Success!");
  Promise.all(
    selectedFiles.map(async (file) => {
      let document = file.document;
      document = {
        ...document,
        sendToChecker: false, // automatically sent to user
        hierarchy: document?.hierarchy || req.payload?.hierarchy || null,
        branchId: document?.branchId || req.payload?.branchId || null,
        departmentId: document?.departmentId || req.payload?.departmentId || null,
      };

      const attachments = file.attachments;
      document.createdBy = req.payload.id;

      if (!document?.statusId) document.statusId = 1;
      if (document?.checker) document.isApproved = false;
      else document.isApproved = true;

      const doc = await Document.create(document, { raw: true });
      const { id } = doc;
      if (doc && !doc.isApproved) addChecker(doc);

      // create index for document
      document.documentIndex &&
        document.documentIndex.map((item) => {
          DocumentIndexValue.create({
            ...item,
            value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,
            documentId: id,
          }).catch((err) => {
            console.log("Index Error", err);
          });
        });

      // User Access / security Level 3 document
      if (doc.securityLevel == 3) {
        console.log(document.userAccess);
        addUserAccess(id, document.userAccess, (err) => {
          if (err) console.log("Error user Access", err);
        });
      }

      return Promise.all(
        attachments.map((attachment) => {
          return uploadAttachment(attachment);
        })
      ).then((list) => {
        const attachments_upload = list.map((file) => {
          const attachment = {
            name: file.originalname,
            fileType: file.mimetype,
            size: file.size / 1024,
            filePath: "/" + itemType + "/" + id + "/" + Date.now() + "-" + file.originalname,
            localPath: file.path,
            itemId: id,
            documentTypeId: file?.documentTypeId || null,
            itemType,
            attachmentType: "bulk-attachment-upload",
            isDeleted: false,
            documentIndex: file?.documentIndex,
            createdBy: 1,
          };

          return attachment;
        });
        return attachments_upload;
      });
    })
  )
    .then(async (allAttachments, failure) => {
      const success = await uploadAttachments([].concat(...allAttachments), res, req);
      if (!success || failure) {
        throw new Error("Error uploading in FTP");
      } else {
        if (typeof success == "object" && success.length > 0) {
          success.map((row) => {
            const attach = row.dataValues;
            // create index for attachment
            attach?.documentIndex &&
              attach.documentIndex.map((item) => {
                DocumentIndexValue.create({
                  ...item,
                  value: typeof item.value == "object" ? JSON.stringify(item.value) : item.value,
                  documentId: attach.itemId,
                  attachmentId: attach.id,
                }).catch((err) => {
                  console.log("Index Error", err);
                });
              });
          });
        }
        return success;
      }
    })
    .then(() => {
      res.send("Success!");
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error! Bulkupload : PROBABLY FTP STORAGE IS FULL : OR SOMETHING ELSE ");
    });
});

router.get("/attachment/download/:id", auth.required, (req, res, next) => {
  // To maintain log
  let log_query;

  checkFtp((isConnected) => {
    if (isConnected) {
      Attachment.findOne({
        logging: (sql) => (log_query = sql),
        where: { id: req.params.id },
      })
        .then(async (attachment) => {
          const filePath = await checkCompressing(attachment);
          await downloadAttachmentFromFtp("temp" + filePath, filePath, req.params.id, false, req.payload).then(
            async (isSuccessful) => {
              // const doc = await getDocument(attachment.id, true);
              // const fileName = doc[0].name;
              // const fileExtension = "." + fileName.replace(/^.*\./, "");

              // const fixLocalPath = replaceExtension(filePath, fileExtension);

              if (isSuccessful) {
                // To maintain log
                await createLog(req, constantLogType.ATTACHMENT, req.params.id, log_query);
                res.send({ success: true, file: filePath });
              } else {
                res.send({ success: false, message: "Error in download!" });
              }
            }
          );
        })
        .catch((err) => {
          logger.error(err);
          res.json({ success: false, message: "Error!!!" });
        });
    } else {
      res.json({ success: false, message: "FTP Server is down!" });
    }
  });
});

router.get("/attachment/preview/:id", auth.required, (req, res, next) => {
  checkFtp((isConnected) => {
    if (isConnected) {
      Attachment.findOne({
        where: { id: req.params.id },
        raw: true,
      })

        .then(async (attachment) => {
          const filePath = await checkCompressing(attachment);
          await downloadAttachmentFromFtp("temp" + filePath, filePath, req.params.id, false, req.payload).then(
            (isSuccessful) => {
              if (isSuccessful) {
                const fileType = attachment.name.split(".");
                res.send({
                  success: true,
                  filePath: filePath,
                  fileType: fileType[fileType.length - 1],
                });
              } else {
                res.send({ success: false, message: "Error!" });
              }
            }
          );
        })
        .catch((err) => {
          res.json({ success: false, message: "Error!!!" });
        });
    } else {
      res.json({ success: false, message: "FTP Server is down!" });
    }
  });
});

router.get("/attachment/special-preview/:id", auth.required, async (req, res, next) => {
  const { token, hourlyAccesId } = req.query;

  const decoded_id = getId(hourlyAccesId);

  const forAllHourly = await HourlyAccess.findOne({
    where: {
      validTill: {
        [Sequelize.Op.gt]: Date.now(),
      },
      token: token,
    },
  });
  if (!forAllHourly) {
    res.json({ success: false, message: "Document time limit has exceeded!" });
    return;
  }
  console.log(decoded_id);
  // get hourlyaccess user
  const userAccessEmail = await execSelectQuery(`
        select * from hourly_access_multiples ham
        join hourly_accesses ha on ha.id =ham.hourlyAccessId
        where ha.id = ${decoded_id}`);

  checkFtp((isConnected) => {
    if (isConnected) {
      Attachment.findOne({
        where: { id: req.params.id },
        raw: true,
      })
        .then(async (attachment) => {
          const filePath = await checkCompressing(attachment);
          downloadAttachmentFromFtp("temp" + filePath, filePath, attachment.id, false, {
            email: userAccessEmail[0]?.userEmail,
          }).then((isSuccessful) => {
            if (isSuccessful) {
              const fileType = attachment.name.split(".");
              res.send({
                success: true,
                filePath: filePath,
                fileType: fileType[fileType.length - 1],
              });
            } else {
              res.send({ success: false, message: "Error!" });
            }
          });
        })
        .catch((err) => {
          res.json({ success: false, message: "Error!!!" });
        });
    } else {
      res.json({ success: false, message: "FTP Server is down!" });
    }
  });
});

// get attachemnt data for edit
router.get("/attachment/:id", auth.required, async (req, res) => {
  const { id } = req.params;
  const attachment = await sequelize.query(singleAttachment(id), {
    type: Sequelize.QueryTypes.SELECT,
  });

  const associatedIds = await sequelize.query(associatedBokIdFromTags(id, "attachId"), {
    type: Sequelize.QueryTypes.SELECT,
  });

  res.status(200).send({ attachment, associatedIds: associatedIds || [] });
});

router.get("/attachmentIndexValue/:id", auth.required, (req, res) => {
  const { id } = req.params;

  Attachment.hasMany(DocumentIndexValue);
  Attachment.hasMany(DocumentTypeIndex);
  Attachment.findOne({
    where: { id: id },
    include: [
      {
        model: DocumentTypeIndex,
        required: false,
      },
    ],
  })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.delete("/attachment/:id", auth.required, async (req, res, next) => {
  const { id } = req.params;
  let isMaker = false;
  // find maker
  const data = await getDocument(id, true);

  // find attachment detail to find it is in approval pending
  const attachment = await Attachment.findOne({ where: { id } });

  // for maker => user can delete their attachments.
  if (typeof data == "object") {
    if ((!data[0].sendToChecker || data[0].returnedByChecker === true) && data[0].createdBy == req.payload.id) {
      isMaker = true;
    }
  }
  deleteItem(
    Attachment,
    {
      id: id,
      type: ATTACHMENT,
      isMaker: attachment.pendingApproval || isMaker,
    },
    req.payload,
    (response) => {
      res.send(response);
    },
    req
  );
});

router.delete("/attachment-by-maker/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  deleteItem(
    Attachment,
    {
      id: id,
      type: ATTACHMENT,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

router.get("/bpm-doc-preview", async (req, res) => {
  const { attachId } = req.query;
  const result = await Attachment.findOne({ where: { id: attachId } });
  res.send({ success: true, data: { attachments: [result] } });
});

const uploader = multer({ storage: storage, dest: "bpm-attachments/" });

router.post("/bpm-document", uploader.any(), async (req, res, next) => {
  const files = req.files;
  let documentId,
    name = req.body.name;

  if (!name) {
    throw new Error("payload document not found");
  }
  const existDocument = await Document.findOne({ where: { name: name } });
  // create one if doesnot exit
  if (!existDocument) {
    const bpmDocument = {
      isDeleted: false,
      isArchived: false,
      isApproved: true,
      name,
      otheTitle,
      statusId: 1,
      documentTypeId: 1,
      createdBy: 1,
    };
    const result = await Document.create(bpmDocument, { raw: true });
    documentId = result.id;
  } else {
    documentId = existDocument.id;
  }

  let attachRes,
    attachments = [];

  files.forEach((selectedFile) => {
    const attachment = {
      name: selectedFile.originalname,
      fileType: selectedFile.mimetype,
      size: selectedFile.size / 1024,
      filePath: "/" + "document" + "/" + documentId + "/" + Date.now() + "-" + selectedFile.originalname,
      localPath: selectedFile.path,
      itemId: documentId,
      itemType: "document",
      securityLevel: 1,
      attachmentType: "bpm-attachment-upload",
      isDeleted: false,
    };
    attachments.push(attachment);
  });

  attachRes = await uploadAttachmentBPM(attachments, req.apiUrl);
  // if (attachRes) {
  //   console.log("five");
  //   bpmDocs.push(attachRes);
  // }

  res.send({ success: true, data: { attachRes } });
});

router.get("/python", async (req, res, next) => {
  const data = await handleEncryptFile({
    remote: "/document/11009/1640851572885-N5ArRHEN7gJRtU87gK1MPE1J.jpg",
    local: "temp\\1640851572850-N5ArRHEN7gJRtU87gK1MPE1J.jpg",
  });
  res.send({ success: true, data });
});

router.get("/test", async (req, res, next) => {});

/**
 * @swagger
 * /api/attachment/excel:
 *    get:
 *      description: parse execl
 *    parameters:
 *      - name: customer
 *        in: query
 *        description: Name of our customer
 *        required: false
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '201':
 *        description: Successfully created user
 */
router.get("/execel", async (req, res, next) => {
  const fs = require("fs");
  const { parse } = require("csv-parse");

  fs.createReadStream("./indexUpdate.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {
      const query = `
      update security_hierarchies
      set branchId =${row[2]} , type='${row[1]}'
      where code ='${row[0]}'`;

      await execUpdateQery(query);
      // console.log(row[0], row[1]);
    })
    .on("end", function () {
      console.log("finished");
    })
    .on("error", function (error) {
      console.log(error.message);
    });

  res.send({ message: "hello", data: "lkds" });
});

router.get("/ocr", async (req, res, next) => {
  const data = await Attachment.findAll({
    where: {
      // itemId: 2,
      ocr: false,
    },
    limit: 2,
    raw: true,
  });
  let result = "";
  Promise.all(
    data.map(async (attach, index) => {
      attach.localPath = "temp/1641361057446-IMG_20211127_130058.jpg";
      console.log("Path==", attach.filePath);
      // await handleOCRFile(attach);
      const content = await pyFTPocrFile(attach);
      await Attachment.update({ attachmentDescription: content, ocr: true }, { where: { id: attach.id } });
    })
  );
  // OCR multiple files

  // await Promise.all(
  //   data.map(async (attach, index) => {
  //     const filePath = attach.filePath;

  //     const isSuccessful = await downloadAttachmentFromFtp(
  //       "temp" + filePath,
  //       filePath,
  //       attach.id,
  //       true
  //     );

  //     if (isSuccessful) {
  //       attach.localPath = "temp" + filePath;
  //       const content = await handleOCRFile(attach);

  //       // Upadate in Database
  //       await Attachment.update(
  //         { attachmentDescription: content, ocr: true },
  //         { where: { id: attach.id } }
  //       );

  //       console.log("success", index);
  //     } else {
  //       // Unsuccessful OCR
  //       // await Attachment.update(
  //       //   { ocr: true },
  //       //   { where: { id: attach.id } }
  //       // );
  //       console.log("failed");
  //     }
  //   })
  // );
  res.send({ success: true, result });
});

router.get("/document-cif/:cif", async (req, res, next) => {
  const { cif } = req.params;
  try {
    const document = await execSelectQuery(`SELECT
    div.id AS documentIndexValueId,
    div.documentId,
    div.documentIndexId,
    div.value,
    div.isDeleted AS documentIndexValueIsDeleted,
    div.attachmentId,
    div.createdAt AS documentIndexValueCreatedAt,
    div.updatedAt AS documentIndexValueUpdatedAt,
    doc.name AS documentName,
    doc.description AS documentDescription,
    att.id AS attachmentId,
    att.name AS attachmentFileName,
    att.filePath AS attachmentFilePath
FROM
    document_index_values div
INNER JOIN
    documents doc
    ON div.documentId = doc.id
INNER JOIN
    attachments att
    ON doc.id = att.itemId
WHERE
    div.value = '${cif}'
    AND att.isDeleted = 0
    AND (div.documentIndexId = 2 OR div.documentIndexId = 8 )`);
    if (document.length === 0) return res.json({ success: false, message: "No document for provided CIF" });
    res.json({ succes: true, data: document });
  } catch (error) {
    res.json({ success: false, message: "Internal server error" });
  }
});

router.get("/document-account-number/:accountNumber", async (req, res, next) => {
  const { accountNumber } = req.params;
  if (accountNumber.length !== 14) {
    res.json({ success: false, message: "Invalid Account Number Must be of 14 Digits" });
  }
  try {
    const document = await execSelectQuery(
      `
      SELECT
      doc.otherTitle AS documentName,
      doc.description AS documentDescription,
      att.id AS attachmentId,
      att.name AS attachmentFileName,
      att.filePath AS attachmentFilePath
      FROM
      documents doc
      INNER JOIN
      attachments att
      ON
      doc.id = att.itemId
      WHERE
      doc.name = ${accountNumber}
      AND
      att.isDeleted = 0
      AND
      doc.isDeleted = 0
      `
    );
    if (document.length === 0) {
      res.json({ success: false, message: "No document found for provided account number" });
    }
    res.json({ success: true, data: document });
  } catch (error) {
    res.json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
