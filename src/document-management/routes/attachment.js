/**
 * @module AttachmentModule
 */
const router = require("express").Router();
const multer = require("multer");
const moment = require("moment");
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { Op } = require("sequelize");
const crypto = require("crypto");

const { deleteItem, ATTACHMENT, deleteItemWithId } = require("../../config/delete");
const { storage, checkFtp } = require("../../config/filesystem");
const {
  Document,
  Attachment,
  DocumentIndexValue,
  Tag,
  DocumentTypeIndex,
  sequelize,
  HourlyAccess,
  MultipleHierarchies,
  DocumentCheckout,
  User,
  Branch,
  SecurityHierarchy,
  ApprovalMaster,
} = require("../../config/database");
const { uploadAttachment } = require("../util/bulk_upload");
const Sequelize = require("sequelize");
const fs = require("fs");
const {
  downloadAttachmentFromFtp,
  uncompressAttachment,
  uploadAttachmentBPM,
  downloadAttachments,
  uploadAttachments,
} = require("../util/attachment");
const _ = require("lodash");
const compressing = require("compressing");
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
const ValidationError = require("../../errors/validation");
const { canViewTheDocument } = require("../auth");
const encryptArchieve = require("../util/encryptArchieve");
const { isPdfBlank, areAnyPdfFilesBlank, checkAttachmentsForDuplicates } = require("../util/pdfUtils");
const isPDFFile = require("../util/isPdf");
const getAssociatedBranches = require("../../util/getAssociatedBranches");

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
    let paginationDocument = await execSelectQuery(paginateQuery(req.query, false, req.payload));
    if (!req.payload.hierarchy.includes("Super")) {
      if (req.payload.branchId && req.payload.roleId !== 1) {
        const userBranch = await Branch.findOne({
          attributes: ["name"],
          where: {
            id: req.payload.branchId,
          },
        });
        if (userBranch.length > 0) {
          const branchName = userBranch[0].name;
          paginationDocument = paginationDocument.filter((doc) => doc.branch === branchName);
        } else {
          paginationDocument = [];
        }
      } else {
        const allowedBranches = await getAssociatedBranches(req.payload.departmentId);
        const allowedBranchNames = allowedBranches.map((b) => b.name);
        paginationDocument = paginationDocument?.filter((doc) => {
          if (doc.branch === null || doc.branch === undefined) {
            return doc.departmentId === req.payload.departmentId;
          }
          return allowedBranchNames.includes(doc.branch);
        });
      }
    }
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
    const indexValues = JSON.parse(req.body.indexValues);
    const associatedIDS = JSON.parse(req.body.associatedIds);
    if (err) {
      console.log(err);
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

      const isCheckerProcess = await ApprovalMaster.findAll({
  where: {
    documentId: itemId
  }
});

      // restrict invalid file types
      const invalidFileTypes = [
        "application/x-ms-dos-executable", //.exe file
        "application/x-msdownload",
        "application/octet-stream", //.bat file
        "application/zip", // zip files
      ];

      files.forEach((file) => {
        // Calculate MD5 hash
        const hash = crypto.createHash("md5");
        const fileBuffer = fs.readFileSync(file.path);
        const fileHash = hash.update(fileBuffer).digest("hex");

        const fileSize = file.size / 1024;
        const maxFileSize = process.env.FILE_SIZE || 51200;

        const attachment = {
          name: file.originalname,
          attachmentDescription: attachmentDesc,
          fileType: file.mimetype,
          size: fileSize,
          isEncrypted: doc.dataValues.hasEncryption || false,
          redaction: JSON.parse(redaction) || false,
          filePath: "/" + "Citizenship/" + itemType + "/" + itemId + "/" + file.originalname,
          localPath: file.path,
          itemId: itemId,
          ...(itemType ? { itemType } : {}),
          attachmentType: "normal-upload",
          isDeleted: false,
          pendingApproval: doc.dataValues.isApproved || isCheckerProcess.length > 0 ? true : false,
          documentTypeId,
          customerName,
          url,
          approvedDate: convertDate(approvedDate),
          createdBy,
          notes,
          md5Hash: fileHash,
        };
        // File type validation
        if (invalidFileTypes.includes(attachment.fileType) && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({ message: "Invalid File Type", success: false });
        }

        // file size limitation
        if (fileSize >= maxFileSize && onlyForThisVendor(banks.citizen.name)) {
          exit = true;
          return res.status(412).send({
            message: "File size exceed limit is " + maxFileSize + " MB",
            success: false,
          });
        }

        return attachments.push({
          ...attachment,
          md5Hash: fileHash,
        });
      });

      // exit  for validation
      if (exit) return;

      const pdfAttachments = attachments?.filter((attachment) => attachment.fileType === "application/pdf");
      const pdfFiles = files?.filter((file) => file.mimetype === "application/pdf");
      const duplicatePDF = await checkAttachmentsForDuplicates(pdfAttachments, doc);

      // check if any pdf file is blank
      const anyBlankPdfFiles = await areAnyPdfFilesBlank(pdfFiles);

      if (anyBlankPdfFiles) {
        return res.status(412).send({
          message: `One of the PDF file(s) is blank. Please upload a valid file.`,
          success: false,
        });
      }

      if (duplicatePDF) {
        return res.status(412).send({
          message: `Duplicate PDF Found. PDF with same hash value already exists!. Please upload a valid file.`,
          success: false,
        });
      }

      uploadAttachments(attachments, res, req)
        .then(async (attachmentIds) => {
          if (!attachmentIds || attachmentIds.length === 0) {
            return res.status(500).send({ message: "Error while uploading !! Rolling back " });
          } else {
            const attachmentsWithIds = attachments.map((attachment, index) => ({
              ...attachment,
              id: attachmentIds[index], // Add the attachmentId from attachmentIds array
            }));
            attachmentIds.forEach((attachmentId) => {
              Promise.all(
                indexValues.map((item) => {
                  DocumentIndexValue.create({
                    ...item,
                    documentId: itemId,
                    value: typeof item.value === "object" ? JSON.stringify(item.value) : item.value,
                    attachmentId: attachmentId,
                  }).catch((err) => {
                    console.log(err);
                    throw new Error("Whoops! Index");
                  });
                })
              );

              // Create Tags
              Promise.all(
                associatedIDS.map(async (tag) => {
                  Tag.create({
                    ...tag,
                    attachId: attachmentId,
                    label: "tag",
                    docId: itemId,
                    documentTypeId,
                  }).catch((err) => {
                    console.log(err);
                    throw new Error("Whoops! Tags");
                  });
                })
              );
            });

            res.send({
              data: attachmentsWithIds,
              success: true,
              message: "Successfully uploaded",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Error while uploading !! Rolling back " });
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
    indexValues = indexValues?.filter((row) => row.documentIndexId);

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

        if (attachments.length == 0) {
          exit = true;
          logger.error(dupliacteDoc);
          // throw new Error("Duplicate document name");
        }
      }
    })
  );

  if (exit) {
    return res.send("Duplicate doc or no attachment! ");
  }
  // ===================================================

  await Promise.all(
    selectedFiles.map(async (file) => {
      let document = file.document;
      document = {
        ...document,
        sendToChecker: true, // automatically sent to user
        hierarchy: document?.hierarchy || req.payload?.hierarchy || null,
        branchId: document?.branchId || req.payload?.branchId || null,
        departmentId: document?.departmentId || req.payload?.departmentId || null,
      };

      const attachments = file.attachments;

      // added owner id and created id
      document.createdBy = req.payload.id;
      document.ownerId = req.payload.id;

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

      return await Promise.all(
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
            createdBy: req.payload.id,
          };
          return attachment;
        });
        return attachments_upload;
      });
    })
  )
    .then(async (allAttachments, failure) => {
      req.body = null;
      const success = await uploadAttachments([].concat(...allAttachments), res, req);
      if (!success || failure) {
        throw new Error("Error uploading in FTP");
      } else {
        if (typeof success == "object" && success.length > 0) {
          success.map((row) => {
            const attach = row.dataValues;
            // create index for attachment
            attach?.documentIndex &&
              attach.documentIndex.map(async (item) => {
                await DocumentIndexValue.create({
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
      res.status(500).send("Error! Bulkupload ");
    });
});

router.get("/attachment/download/:id/:cw", auth.required, (req, res, next) => {
  let customWatermarkValue = req.params.cw || 1;
  // To maintain log
  let log_query;

  checkFtp((isConnected) => {
    if (isConnected) {
      Attachment.findOne({
        logging: (sql) => (log_query = sql),
        where: { id: req.params.id },
      })
        .then(async (attachment) => {
          const useWatermarkConfig = attachment.customWatermark;
          const customWatermarkID = attachment.customWatermarkId;
          const isPreferredWatermark = attachment.isPreferredWatermark;
          const filePath = await checkCompressing(attachment);
          console.log("temp" + filePath, filePath, req.params.id, false, req.payload);
          downloadAttachmentFromFtp(
            "temp" + filePath,
            filePath,
            req.params.id,
            false,
            req.payload,
            customWatermarkValue,
            useWatermarkConfig,
            customWatermarkID,
            isPreferredWatermark
          ).then(async (isSuccessful) => {
            // const doc = await getDocument(attachment.id, true);
            // const fileName = doc[0].name;
            // const fileExtension = "." + fileName.replace(/^.*\./, "");

            // const fixLocalPath = replaceExtension(filePath, fileExtension);

            if (isSuccessful) {
              // To maintain log
              await createLog(req, constantLogType.ATTACHMENT, req.params.id, log_query);
              const encodePath = encodeURI(filePath);

              res.send({ success: true, file: encodePath });
            } else {
              res.send({ success: false, message: "Error in download!" });
            }
          });
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

router.get("/attachment/preview/:id/:cw", auth.required, async (req, res, next) => {
  const customWatermarkValue = req.params.cw || 14;
  checkFtp((isConnected) => {
    if (isConnected) {
      Attachment.findOne({
        where: { id: req.params.id },
        raw: true,
      })

        .then(async (attachment) => {
          const findUser = await User.findOne({
            where: { id: req.payload.id },
          });

          const isPreferredWatermark = findUser.dataValues.hasCustomWatermark || false;
          const customWatermarkID = findUser.dataValues.customWatermarkId || customWatermarkValue;
          // get file type return false if its not pdf
          // const getFileType =
          const filePath = await checkCompressing(attachment);
          const isPdf = isPDFFile(filePath);
          downloadAttachmentFromFtp(
            "temp" + filePath,
            filePath,
            req.params.id,
            isPdf,
            req.payload,
            customWatermarkID,
            isPreferredWatermark,
            req.payload.id,
            customWatermarkValue
          ).then((isSuccessful) => {
            if (isSuccessful) {
              const fileType = attachment.name.split(".");

              const encodePath = encodeURI(filePath);

              res.send({
                success: true,
                filePath: encodePath,
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

router.get("/attachment/special-preview/:id", async (req, res, next) => {
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
    // set redactionStatus to 0 in Attachment table
    Attachment.update(
      {
        redactionStatus: 0,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.json({ success: false, message: "Document time limit has exceeded!" });
    return;
  }
  // get hourlyaccess user
  const userAccessEmail = await HourlyAccess.findOne({
  where: {
    id: decoded_id
  },
  include: [{
    model: HourlyAccessMultiple,
    as: 'hourlyAccessMultiples'
  }]
});

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
              const redactionStatus = attachment.redaction;
              const redactedFilePath = attachment.redactedFilePath;

              res.send({
                success: true,
                filePath: redactionStatus ? redactedFilePath : filePath,
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

  await deleteItem(
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
router.get("/excel", async (req, res, next) => {
  const fs = require("fs");
  const { parse } = require("csv-parse");

  fs.createReadStream("./indexUpdate.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {
      await SecurityHierarchy.update(
        {
          branchId: row[2],
          type: row[1]
        },
        {
          where: {
            code: row[0]
          }
        }
      );
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

//  route to encrypt archieve attachments regardless of isEncrypted feature is enabled or not

router.get("/encrypt-archieve", async (req, res) => {
  encryptArchieve();
});

module.exports = router;
