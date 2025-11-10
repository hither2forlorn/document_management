const router = require("express").Router();
const crypto = require("crypto");
// const oracledb = require("oracledb");

//AUTHENTICATION
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { deleteItem, DOCUMENT, BRANCH } = require("../../config/delete");
const { canViewTheDocument } = require("../auth");
//DATABASE
const Fuse = require("fuse.js");
const { excelData } = require("../sqlQuery/excelData");

// For BOK CBS oracle database
// const connection = require("../../config/oracle");

const Op = require("sequelize").Op;
const DocumentAuditModel = require("../models/document_audit");
const Sequelize = require("sequelize");
const {
  User,
  Watermark,
  Document,
  DocumentAudit,
  DocumentType,
  Department,
  LocationMap,
  DocumentAccessUser,
  HourlyAccess,
  Attachment,
  DocumentCheckout,
  SequelizeInstance,
  DocumentIndexValue,
  DocumentTypeIndex,
  Favourite,
  sequelize,
  bok_lms_Sequelize,
  Tag,
  oracleCredentials,
  HourlyAccessMultiple,
  ApprovalMaster,
  SecurityHierarchy,
  Branch,
} = require("../../config/database");
const _ = require("lodash");
const { getBOKIDs, verifyBOKID, getCustomerDetails, getBOKIDsCBS } = require("../sqlQuery/bok-view");
//SECURITY LEVEL
const {
  addUserAccess,
  updateUserAccess, // LEVEL THREE - USER LEVEL
  hourlyAccess,
} = require("../security-level");
const { downloadAttachments } = require("../util/attachment");
//APPROVAL QUEUE
const {
  addChecker,
  approveDocument,
  isChecker,
  makerOrChecker,
  resubmitDocument,
  archiveDocument,
  sendEmailMakerCheckerInit,
  sendEmailDocumentDelete,
} = require("../util/checker");
//EMAIL
const { sendMessage } = require("../../util/send_email");
const { documentUpdateTemplate } = require("../../util/email_template");
const {
  paginateQuery,
  totalDocuments,
  getArchivedDocumnet,
  getPendingDocument,
  getRejectedDocument,
  getSavedDocument,
} = require("../util/documentPaginate");
const { getSearchTree } = require("../../util/item_tree");
const validator = require("../../util/validation");

const { body, validationResult } = require("express-validator");
const { Docs, DocsCIF } = require("../../validations/docs");
const { DocsEdit } = require("../../validations/docs");
const { documentAttachment, associatedBokIdFromTags, docTagSearch } = require("../sqlQuery/attachment");
const { handleOTPSend } = require("../../util/OTP/otpSend");
const { execSelectQuery, execUpdateQery } = require("../../util/queryFunction");
const { getDocument } = require("../util/getModelDetail");
const { default: Axios, default: axios } = require("axios");
const { sendOtpAccessInfoToOwner } = require("../security-level/3");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { consoleLog } = require("../../util");
const { queryAttachmentMakerChecker, queryPendingApprovalAttachments } = require("../sqlQuery/documentMakerChecker");
const isSuperAdmin = require("../sqlQuery/isSuperAdmin");
const { edit_delete_document, validateUserIsInSameDomain } = require("../middleware/edit_delete_document");
const { rmSync } = require("fs");
const jwt = require("jsonwebtoken");
const writeToFile = require("../../util/writeToFile");
const { duplicateChecker } = require("../util/checkDuplicateDoc");
const RoleUtils = require("../util/roleUtils");
const { Console } = require("console");

const moment = require("moment"); // Make sure you have moment installed: npm install moment

async function auditDocument(documentId, userId, accessType, type, message) {
  await DocumentAudit.create({
    documentId: documentId,
    dateTime: Date.now(),
    accessType: accessType,
    accessedBy: userId,
    type,
    message,
  });
}

async function sendToUser(docId) {
  const doc = await Document.findOne({
    where: { id: docId },
    raw: true,
  });
  const getUserOwner = User.findOne({
    where: { id: doc.ownerId },
    raw: true,
    attributes: ["email", "name"],
  });
  const getUserEditor = User.findOne({
    where: { id: doc.editedBy },
    raw: true,
    attributes: ["email", "name"],
  });
  const [owner, editor] = await Promise.all([getUserOwner, getUserEditor]);
  // await sendMessage(documentUpdateTemplate(owner, editor ? editor : {}, doc));
}

router.post("/document", [validator(Docs)], auth.required, async (req, res, next) => {
  let log_query;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors });
  }
  req.body.isDeleted = false;
  req.body.ownerId = req.payload.id;
  req.body.createdBy = req.payload.id;
  req.body.editedBy = req.payload.id == 1;
  req.body.returnedByChecker = false;
  req.body.hierarchy = req.body.hierarchy || req.payload?.hierarchy || null;
  if (req.payload?.branchId === 1) {
    req.body.branchId = req.body.branchId || null;
  } else {
    req.body.branchId = req.payload?.branchId || null;
  }
  req.body.departmentId = req.body.departmentId ? req.body.departmentId : req.payload.departmentId;
  const otherTitle = req.body?.otherTitle;
  req.body.name =
    req.body?.name || (typeof otherTitle == "string" && otherTitle.length > 14) ? otherTitle.substring(0, 14) : otherTitle;
  // Security hierarchy removed for rbb so manually added for future use
  // if (onlyForThisVendor(banks.rbb.name)) req.body.securityLevel = 2;

  const indexValues = req.body.document_index_values || [];

  const documentTags = req.body.tags || [];
  if (req.body.checker) {
    req.body.isApproved = false;
  } else {
    req.body.isApproved = true;
  }
  req.body.hasEncryption = true;
  const checkDuplicateDoc = await Document.findOne({
    where: {
      name: req.body.name,
      isDeleted: false,
    },
  });

  console.log(checkDuplicateDoc, "this is duplicate doc");
  if (checkDuplicateDoc) {
    return res.json({
      success: false,
      message: "Duplicate Document",
    });
  }
  await Document.create(req.body, {
    logging: (sql) => (log_query = sql),
    raw: true,
  })
    .then(async (doc) => {
      const filtered_values = indexValues.filter((item) => typeof item.documentIndexId !== "number");
      filtered_values.map((item) => {
        DocumentIndexValue.create({ ...item, documentId: doc.id }).catch((err) => {
          console.log("Index Error", err);
        });
      });
      if (!doc.isApproved) addChecker(doc);

      // creating the new a new document tags
      await Promise.all(
        documentTags.map(async (tag) => {
          await Tag.create({
            ...tag,
            docId: doc.id,
            value: tag,
            departmentId: req.payload.departmentId,
            branchId: req.payload.branchId,
            createdBy: req.payload.id,
            label: "tag",
          });
        })
      );

      switch (doc.securityLevel) {
        case 3:
          addUserAccess(doc.id, req.body.userAccess, async (err) => {
            if (err) console.log("Error", err);
            await createLog(req, constantLogType.DOCUMENT, doc.id, log_query);
            res.json({
              success: true,
              message: "Document successfully created!",
              id: doc.id,
            });
          });
          break;
        default:
          await createLog(req, constantLogType.DOCUMENT, doc.id, log_query);
          res.json({
            success: true,
            message: req.body.isApproved ? "Document successfully created!" : "Document Approval pending",
            id: doc.id,
          });
          break;
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Document not created!" });
    });
});

//create new document by CIF
router.post("/document-cifNumber", [validator(DocsCIF)], auth.required, async (req, res, next) => {
  let log_query;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors });
  }
  req.body.isDeleted = false;
  req.body.ownerId = req.payload.id;
  req.body.createdBy = req.payload.id;
  req.body.editedBy = req.payload.id == 1;
  req.body.returnedByChecker = false;
  req.body.hierarchy = req.body.hierarchy || req.payload?.hierarchy || null;
  if (req.payload?.branchId === 1) {
    req.body.branchId = req.body.branchId || null;
  } else {
    req.body.branchId = req.payload?.branchId || null;
  }
  req.body.departmentId = req.body.departmentId ? req.body.departmentId : req.payload.departmentId;

  const getIdentifier = (tag) => {
    return tag + "-" + moment().format("YYYY-MM-DD") + "-" + Date.now();
  };

  req.body.identifier = getIdentifier("DOC");

  req.body.otherTitle = (req.body["2"] || req.body["8"]) + req.body.cifName;
  //req.body.name =
  // req.body?.name  || (typeof otherTitle == "string" && otherTitle.length > 14) ? otherTitle.substring(0, 14) : otherTitle;

  // Security hierarchy removed for rbb so manually added for future use
  // if (onlyForThisVendor(banks.rbb.name)) req.body.securityLevel = 2;

  const indexValues = req.body.document_index_values || [];

  const documentTags = req.body.tags || [];
  req.body.isApproved = true;

  const checkDuplicateDoc = await Document.findOne({
    where: {
      otherTitle: req.body.otherTitle,
      isDeleted: false,
    },
  });

  if (checkDuplicateDoc) {
    return res.json({
      success: false,
      message: "Duplicate Document",
    });
  }

  await Document.create(req.body, {
    logging: (sql) => (log_query = sql),
    raw: true,
  })
    .then(async (doc) => {
      const filtered_values = indexValues.filter((item) => typeof item.documentIndexId !== "number");
      filtered_values.map((item) => {
        DocumentIndexValue.create({ ...item, documentId: doc.id }).catch((err) => {
          console.log("Index Error", err);
        });
      });
      if (!doc.isApproved) addChecker(doc);

      // creating the new a new document tags
      await Promise.all(
        documentTags.map(async (tag) => {
          await Tag.create({
            ...tag,
            docId: doc.id,
            value: tag,
            departmentId: req.payload.departmentId,
            branchId: req.payload.branchId,
            createdBy: req.payload.id,
            label: "tag",
          });
        })
      );

      switch (doc.securityLevel) {
        case 3:
          addUserAccess(doc.id, req.body.userAccess, async (err) => {
            if (err) console.log("Error", err);
            await createLog(req, constantLogType.DOCUMENT, doc.id, log_query);
            res.json({
              success: true,
              message: "Document successfully created!",
              id: doc.id,
            });
          });
          break;
        default:
          await createLog(req, constantLogType.DOCUMENT, doc.id, log_query);
          res.json({
            success: true,
            message: req.body.isApproved ? "Document successfully created!" : "Document Approval pending",
            id: doc.id,
          });
          break;
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Document not created!" });
    });
});

router.get("/bpm-doc-preview", async (req, res) => {
  const { attachId } = req.query;
  const result = await Attachment.findOne({ where: { id: attachId } });
  res.send({ success: true, data: { attachments: [result] } });
});

const cache = {};
const CACHE_TTL = 300000;

const getFromCache = (key) => {
  const cached = cache[key];
  if (!cached) return null;
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    delete cache[key];
    return null;
  }
  return cached.data;
};

const setInCache = (key, data) => {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
};
router.get("/document/pagination", auth.required, async (req, res, next) => {
  try {
    const userId = req.payload.id;
    req.query.userId = userId;
    console.log(req.query, "here");

    const cacheKey = JSON.stringify(req.query);
    const cachedData = getFromCache(cacheKey);

    if (cachedData) {
      return res.send({
        paginationDocument: cachedData.paginationDocument,
        total: cachedData.total,
        success: true,
      });
    }

    const paginationDocument = await execSelectQuery(paginateQuery(req.query, false, req.payload));
    const totalDocument = await execSelectQuery(paginateQuery(req.query, true, req.payload));

    const response = {
      paginationDocument,
      total: totalDocument[0]?.total,
      success: true,
    };

    setInCache(cacheKey, response);

    res.send(response);
  } catch (error) {
    next(error);
  }
});

router.get("/document", auth.required, async (req, res, next) => {
  const {
    // simpleText,
    advanceText,
    departmentId,
    documentTypeId,
    locationMapId,
    statusId,
    startDate,
    endDate,
    expiryDate,
    isArchived,
    isApproved,
    identifier,
    page,
    size,
  } = req.query;
  let { simpleText } = req.query;
  const departments = await getSearchTree(Department, departmentId, "departmentId");
  const locationMaps = await getSearchTree(LocationMap, locationMapId, "locationMapId");
  const documentTypes = await getSearchTree(DocumentType, documentTypeId, "documentTypeId");
  const searchQuery = {
    isDeleted: false,
    ...(identifier ? { identifier } : {}),
    ...(statusId ? { statusId } : {}),
    ...(isArchived === "true" ? { isArchived: true } : { isArchived: false }),
    ...(isApproved ? { isApproved: true } : { isApproved: true }),
    ...(simpleText
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${simpleText}%` } },
            { otherTitle: { [Op.like]: `%${simpleText}%` } },
            { description: { [Op.like]: `%${simpleText}%` } },
            { identifier: { [Op.like]: `%${simpleText}%` } },
            { "$attachments.name$": { [Op.like]: `%${simpleText}%` } },
            {
              "$attachments.attachmentDescription$": {
                [Op.like]: `%${simpleText}%`,
              },
            },
          ],
        }
      : {}),
    ...(documentTypeId || locationMapId || departmentId
      ? {
          [Op.and]: [
            documentTypeId
              ? {
                  [Op.or]: documentTypeId ? documentTypes : [],
                }
              : {},
            locationMapId
              ? {
                  [Op.or]: locationMapId ? locationMaps : [],
                }
              : {},
            departmentId
              ? {
                  [Op.or]: departmentId ? departments : [],
                }
              : {},
          ],
        }
      : {}),
  };
  if (expiryDate) {
    const expiry = Date.now() + 86400000 * 7 * expiryDate; // ONE DAY = 86400000 millis
    searchQuery.disposalDate = {
      [Op.gte]: Date.now(),
      [Op.lte]: expiry,
    };
  }
  if (startDate) {
    searchQuery.createdAt = {
      [Op.gte]: startDate,
      ...searchQuery.createdAt,
    };
  }
  if (endDate) {
    searchQuery.createdAt = {
      [Op.lte]: endDate,
      ...searchQuery.createdAt,
    };
  }

  let cloneQuery = {};
  cloneQuery = req.query;
  if (page && size) {
    delete cloneQuery["page"];
    delete cloneQuery["size"];
  }
  if (documentTypeId) {
    delete cloneQuery["documentTypeId"];
  }

  let regTest = /[a-z0-9\u0915-\u0959]/iu.test(Object.values(cloneQuery).toString());
  if (
    !(
      simpleText ||
      advanceText ||
      departmentId ||
      // documentTypeId ||
      locationMapId ||
      statusId ||
      startDate ||
      endDate ||
      expiryDate ||
      isArchived ||
      isApproved ||
      identifier
    ) &&
    regTest
  ) {
    const arrKey = Object.keys(cloneQuery);
    const arrVal = Object.values(cloneQuery);
    const likeVal = arrVal.map((val) => {
      return {
        [Op.like]: `%${val}%`,
      };
    });
    DocumentTypeIndex.hasMany(DocumentIndexValue, {
      foreignKey: "documentIndexId",
      sourceKey: "id",
    });
    Document.hasMany(DocumentIndexValue, {
      sourceKey: "id",
      foreignKey: "documentId",
    });
    DocumentIndexValue.belongsTo(DocumentTypeIndex);

    let all = await Document.findAll({
      include: {
        model: DocumentIndexValue,
        attributes: ["value", "documentId", "documentIndexId"],
        where: {
          // value: arrVal,
          value: {
            [Op.or]: likeVal,
          },
        },
        include: {
          model: DocumentTypeIndex,
          attributes: ["id", "docId", "label"],
          where: {
            label: arrKey,
          },
        },
      },
      subQuery: false,
      raw: true,
    });
    if (all) {
      return res.json({ success: true, data: all });
    }
  }

  Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
  Document.findAll({
    where: {
      ...searchQuery,
    },
    order: [["createdAt", "DESC"]],
    include: {
      model: Attachment,
      attributes: ["name", "attachmentDescription"],
      where: {
        isDeleted: false,
        /*   [Op.or]:[
          { name: { [Op.like]: `%${advanceText}%` } },
          { attachmentDescription: { [Op.like]: `%${advanceText}%`} },
        ], */
        itemType: "document",
      },
      required: false,
    },
  })
    .then((docs) => {
      let sendDocs = docs;
      if (advanceText) {
        const options = {
          threshold: 0.6, // Default: 0.6 --- 0.0 = Exact match  |||| 1.0 = Any match
          keys: process.env.META_DATA_DOCUMENT
            ? process.env.META_DATA_DOCUMENT.split(",")
            : ["name", "attachmentDescription"],
        };
        const fuse = new Fuse(docs, options);
        sendDocs = fuse.search(advanceText).map((doc) => doc.item);
      }
      canViewTheDocument(req.payload.id, sendDocs)
        .then((data) => {
          res.json({ success: true, data: data });
        })
        .catch((err) => {
          console.log(err);
          res.json({
            success: false,
            message: "Error occurred due to permission issues!!",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: true, message: "Error!" });
    });
});

//get by accountNumber
router.get("/document-accountNumber", async (req, res, next) => {
  const { accountNumber } = req.query; // Using query parameter
  // Validate account number
  if (!accountNumber || accountNumber.length !== 14) {
    return res.json({ success: false, message: "Invalid Account Number. Must be of 14 Digits" });
  }

  try {
    // Query to fetch documents and related attachments
    const documents = await execSelectQuery(
      `
      SELECT
        doc.id AS documentId,
        doc.name AS documentName,
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
        doc.name = '${accountNumber}'  -- Using single quotes for the account number
      AND
        att.isDeleted = 0
      `
    );
    // Check if any documents were found
    if (documents.length === 0) {
      return res.json({ success: false, message: "No document found for the provided account number" });
    }

    // Group the results by documentId and create a response structure with multiple attachments per document
    const result = [];
    let currentDocument = null;

    documents.forEach((doc) => {
      if (currentDocument && currentDocument.documentId === doc.documentId) {
        // Add attachment to the existing document
        currentDocument.attachmentInfo.push({
          attachmentId: doc.attachmentId,
          attachmentFileName: doc.attachmentFileName,
          attachmentFilePath: doc.attachmentFilePath,
        });
      } else {
        // New document, add to result array
        if (currentDocument) result.push(currentDocument);

        currentDocument = {
          documentId: doc.documentId,
          documentName: doc.documentName,
          documentDescription: doc.documentDescription || null, // Handling null descriptions
          attachmentInfo: [
            {
              attachmentId: doc.attachmentId,
              attachmentFileName: doc.attachmentFileName,
              attachmentFilePath: doc.attachmentFilePath,
            },
          ],
        };
      }
    });

    // Push the last document
    if (currentDocument) result.push(currentDocument);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Internal server error" });
  }
});

// not used
router.get("/document/pending", auth.required, async (req, res, next) => {
  const query = `select d.*,am.type from documents d
  join approval_masters am on am.documentId = d.id
  join approval_queues aq on aq.approvalMasterId = am.id
  where d.isApproved = 0 and isArchived = 0 and aq.isApprover = 1 and aq.userId = ${req.payload.id}
  order by createdAt desc`;

  const finalDocs = await execSelectQuery(query);

  if (finalDocs) {
    res.send({ success: true, data: finalDocs });
  } else {
    res.send({ success: false, message: "Error occurred!!" });
  }
});

router.get("/document/notification", auth.required, async (req, res, next) => {
  const userId = req.payload.id;
  const selectQuery = "select notification.* ";
  const countquery = "select count(*) as total";
  const orderQuery = " ORDER BY notification.createdBy";
  const query = `
  from
  (
  select distinct d.* from documents d
  join approval_masters am on am.documentId = d.id
  join approval_queues aq on aq.approvalMasterId = am.id
  where d.isApproved = 0 and isDeleted=0 and isArchived = 0  and aq.isApprover = 1 and
  (d.returnedByChecker is null or d.returnedByChecker = 0) and sendToChecker=1 and aq.userId=${userId}

  UNION
  select distinct d.* from documents d
  join approval_masters am on am.documentId = d.id
  join approval_queues aq on aq.approvalMasterId = am.id
  where d.isApproved = 0 and isDeleted = 0 and isArchived = 0 and d.returnedByChecker = 1 and am.initiatorId = ${userId}

  UNION
  select distinct d.* from approval_masters am
	join documents d on d.id=am.documentId
	WHERE
  ( am.assignedTo = ${userId} or am.initiatorId =${userId})
  and isDeleted = 0 and type='attachment' and isActive =1)  notification

  `;

  try {
    const paginationDocument = await execSelectQuery(selectQuery + query + orderQuery);
    const totalDocument = await execSelectQuery(countquery + query);
    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      user: req.payload,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
  }
});
router.get("/document/pending-pagination", auth.required, async (req, res, next) => {
  console.log(req.payload);

  req.query.userId = req.payload.id;
  // console.log(getPendingDocument(req.query, (count = false), req.payload));
  try {
    const paginationDocument = await execSelectQuery(getPendingDocument(req.query, (count = false), req.payload));
    const totalDocument = await execSelectQuery(getPendingDocument(req.query, (count = true), req.payload));

    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      user: req.payload,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
  }
});

router.get("/document/rejected-pagination", auth.required, async (req, res, next) => {
  req.query.userId = req.payload.id;

  try {
    const paginationDocument = await execSelectQuery(getRejectedDocument(req.query, (count = false), req.payload));
    const totalDocument = await execSelectQuery(getRejectedDocument(req.query, (count = true), req.payload));

    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      user: req.payload,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
  }
});

router.get("/document/saved-pagination", auth.required, async (req, res, next) => {
  let reqPayload = {
    id: 1,
    email: "admin@gentech.com",
    roleId: 1,
    hierarchy: "Super-001",
    branchId: 1,
  };
  req.query.userId = req.payload.id;

  try {
    const paginationDocument = await execSelectQuery(getSavedDocument(req.query, (count = false), req.payload));
    const totalDocument = await execSelectQuery(getSavedDocument(req.query, (count = true), req.payload));
    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      user: req.payload,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
  }
});

router.get("/document/archived", auth.required, async (req, res, next) => {
  req.query.userId = req.payload.id;
  try {
    const paginationDocument = await sequelize.query(getArchivedDocumnet(req.query, false, req.payload), {
      type: Sequelize.QueryTypes.SELECT,
    });

    const totalDocument = await sequelize.query(
      // true for counting document
      getArchivedDocumnet(req.query, true, req.payload),
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
  }
});

router.get("/document/preview", auth.required, async (req, res, next) => {
  const { token, type } = req.query;
  const hourly = await HourlyAccess.findOne({
    where: {
      validTill: {
        [Op.gt]: Date.now(),
      },
      [Op.or]: [{ userId: req.payload.id }, { userEmail: req.payload.email }],
      token: token,
    },
  });
  const forAllHourly = await HourlyAccess.findOne({
    where: {
      validTill: {
        [Op.gt]: Date.now(),
      },
      token: token,
    },
  });
  if (hourly || forAllHourly.userEmail) {
    const id = hourly ? hourly.documentId : forAllHourly.documentId;
    Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
    let doc = {};
    if (!type) {
      doc = await Document.findOne({
        where: { id: id },
        include: [
          {
            model: Attachment,
            where: { isDeleted: false, redaction: false, itemType: "document" },
            required: false,
          },
        ],
      });
    } else {
      doc = await Document.findOne({
        where: { id: id },
        include: [
          {
            model: Attachment,
            where: { isDeleted: false, itemType: "document" },
            required: false,
          },
        ],
      });
    }

    const data = [doc];
    if (data) {
      const images = _.filter(data[0].attachments, (a) => a.fileType.includes("image"));
      const isWatermark = await Watermark.findOne({
        where: { isActive: true },
      });
      await downloadAttachments(images, isWatermark);
      await auditDocument(id, req.payload.id, DocumentAuditModel.OPEN);
      res.send({ success: true, data: data[0] });
    } else {
      res.status(500).send();
    }
  } else {
    res.status(500).send();
  }
});

//Special Access
router.get("/document/special-preview", async (req, res) => {
  const { token, type, attachId, docId } = req.query;
  const forAllHourly = await HourlyAccess.findOne({
    where: {
      validTill: {
        [Op.gt]: Date.now(),
      },
      token: token,
    },
  });
  if (forAllHourly && forAllHourly.userEmail) {
    const id = forAllHourly.documentId;
    Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
    let doc = {};
    if (!type) {
      doc = await Document.findOne({
        where: { id: id },
        include: [
          {
            model: Attachment,
            where: { isDeleted: false, redaction: false, itemType: "document" },
            required: false,
          },
        ],
      });
    } else {
      doc = await Document.findOne({
        where: { id: id },
        include: [
          {
            model: Attachment,
            where: {
              isDeleted: false,
              redaction: false,
              itemType: "document",
              // id: attachId,
            },
            required: false,
          },
        ],
      });
    }
    const data = [doc];
    if (data) {
      const images = _.filter(data[0].attachments, (a) => a.fileType.includes("image"));
      const isWatermark = await Watermark.findOne({
        where: { isActive: true },
      });
      await downloadAttachments(images, isWatermark);
      await auditDocument(id, 0, DocumentAuditModel.OPEN);
      res.json({ success: true, data: data[0] });
    } else {
      res.status(500).json({ success: false, message: "Error!" });
    }
  } else if (!forAllHourly) {
    res.json({ success: false, message: "Document time limit has exceeded!" });
  } else {
    res.status(401).json({ success: false, message: "Error!" });
  }
});

/**
 * unused
 * generate link for hourly access
 */
router.post("/document/hourly-access", auth.required, async (req, res, next) => {
  const { attachmentId, documentId, durationInMillis, selectedUsers, previewUrl } = req.body;
  const { selectedEmails, otherUrl, type } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const validTill = Date.now() + durationInMillis;
  await Promise.all(
    // for internal users
    selectedUsers
      ? selectedUsers.length > 0
        ? selectedUsers.map((u) => {
            return Promise.all([
              HourlyAccess.create({
                userId: u.value,
                documentId,
                attachmentId,
                validTill,
                token: token,
              }),

              hourlyAccess({
                userId: u.value,
                validTill,
                url: previewUrl + token,
                type: type,
                attachmentId,
              }),
            ]);
          })
        : ""
      : "",

    // for email users
    selectedEmails.join("").length > 0
      ? selectedEmails.map(async (email) => {
          return await Promise.all([
            HourlyAccess.create({
              userEmail: email,
              documentId,
              attachmentId,
              validTill,
              token: token,
            }),
            hourlyAccess({
              userEmail: email,
              validTill,
              // url: previewUrl + token
              url: otherUrl + token,
              type: type,
              attachmentId,
            }),
          ]);
        })
      : ""
  );
  res.send({ success: true, message: "Successful!" });
});

/**
 *
 * used
 * @swagger
 * /api/document/hourly-access-multiple:
 *    post:
 *      description: Add hourly acesses for multiple attachment
 *    parameters:
 *      - attachmentId: array
 *        selectedEmails: array
 *        description: Name of our customer
 *        required: false
 *        schema:
 *          type: number
 *          format: string
 *
 *    responses:
 *      '201':
 *        description: Successful created
 */
router.post("/document/hourly-access-multiple", auth.required, async (req, res, next) => {
  const {
    attachmentId, //array
    documentId,
    durationInMillis,
  } = req.body;

  const attachments = attachmentId;
  console.log(attachments, typeof attachments);

  if (!attachments || (typeof attachments == "object" && attachments.length == 0)) {
    return res.send({ success: false, message: "No attachment selected" });
  }

  const { selectedEmails, otherUrl, type } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const validTill = Date.now() + durationInMillis;

  let hourlyAccess_data;
  let hourly_access_id;
  if (selectedEmails && selectedEmails.length > 0) {
    if (Object.keys(selectedEmails[0]).length <= 0) {
      return res.send({
        success: false,
        message: "Please enter email address",
      });
    }
    const data = await Promise.all(
      selectedEmails.map(async (value) => {
        hourlyAccess_data = await HourlyAccess.create({
          userId: value?.userId,
          userEmail: value?.userEmail,
          attachmentId: "",
          documentId,
          validTill,
          token: token,
        });

        await hourlyAccess({
          userEmail: value?.userEmail,
          validTill,
          hourlyAccessId: hourlyAccess_data?.id || "",
          // url: previewUrl + token
          url: otherUrl + token,
          type: type,
          attachmentId,
        });
        return hourlyAccess_data;
      })
    );
    hourly_access_id = data[0].dataValues.id ? data[0].dataValues.id : "";
    console.log(hourly_access_id, "hourly_access_id");
    attachments.map(async (value) => {
      await HourlyAccessMultiple.create({
        attachmentId: value.value,
        hourlyAccessId: hourly_access_id,
      });
    });
  }
  res.send({ success: true, message: "Successful created!" });
});

async function validateUserApprove(req, res, next) {
  // validate user to approve
  const approval_master = await ApprovalMaster.findAll({
    where: {
      documentId: req.body.id,
      isActive: 1,
    },
  });

  // if (approval_master.length > 1) return res.send({ message: "Error: Please Contact Administrator", success: false });
  if (approval_master[0].assignedTo != req.payload.id)
    return res.send({ message: "you have no right to approve the document", success: false });

  next();
}

router.post("/document/approve", auth.required, validateUserApprove, (req, res, next) => {
  approveDocument(req.payload.id, req.body.id, (message) => {
    if (message.success) {
      auditDocument(req.body.id, req.payload.id, DocumentAuditModel.Approve, message.type);
    }
    res.json(message || "failed");
  });
});

// reject document
router.post("/document/archive", auth.required, (req, res, next) => {
  archiveDocument(req.payload.id, req.body.id, req.body.rejectReason, (message) => {
    if (message.success) {
      auditDocument(req.body.id, req.payload.id, DocumentAuditModel.Decline, req.body.rejectReason);
    }
    res.json(message);
  });
});

router.post("/document/resubmit", auth.required, (req, res, next) => {
  resubmitDocument(req.payload.id, req.body.id, (message) => {
    if (message.success) {
      auditDocument(req.body.id, req.payload.id, DocumentAuditModel.Resubmit, message.type);
    }
    res.json(message);
  });
});

router.post("/document/send-to-checker", auth.required, async (req, res, next) => {
  const { id, message } = req.body;

  // validate on send to checker

  // Dont send empty attachment to checker.
  Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
  const document = await Document.findOne({
    where: { id },
    include: {
      model: Attachment,
      attributes: ["name", "attachmentDescription"],
      where: {
        isDeleted: false,
      },
      required: false,
    },
  });

  if (document.attachments.length == 0)
    return res.json({
      success: false,
      message: "Please add attachment before sending to checker",
    });

  await execUpdateQery(
    `update documents set sendToChecker=1 ${message ? `, description='${message}'` : ""}  where id =  ${id}`
  );

  const approval_master = await execSelectQuery(
    `select * from approval_masters am where documentId =${id} and type='document'`
  );

  // await sendEmailMakerCheckerInit(document.ownerId, approval_master[0]?.assignedTo, id);

  await createLog(
    req,
    constantLogType.DOCUMENT,
    req.body.id,
    `update documents set sendToChecker=1  where id =  ${req.body.id}`
  );

  res.json({
    success: true,
    message: "Successfully Sent to Checker",
  });
});

router.post(
  "/document/send-attachment-to-checker",
  auth.required,

  async (req, res, next) => {
    const { id, message, userId } = req.body;

    // Send attachment to checker
    const attachmentMakerChecker = await queryAttachmentMakerChecker(id);

    // search pendingApproval attachments
    const pendingApprovalAttachments = await queryPendingApprovalAttachments(id);

    if (attachmentMakerChecker.length > 0) return res.send({ success: false, message: "Already send to checker." });

    if (pendingApprovalAttachments.length <= 0) return res.send({ success: false, message: "No Attachment Uploaded." });

    let doc = await getDocument(id);

    doc.checker = [{ userId, isApprover: true }];
    doc.userId = userId;

    addChecker(doc, true);

    await execUpdateQery(
      `update documents set sendToChecker=1 ${message ? `, description='${message}'` : ""}  where id =  ${id}`
    );

    createLog(
      req,
      constantLogType.DOCUMENT,
      req.body.id,
      `update documents set sendToChecker=1  where id =  ${req.body.id}`
    ),
      res.json({
        success: true,
        message: "Document Sent to Checker",
      });
  }
);

router.get("/document/maker-checker", auth.required, (req, res, next) => {
  makerOrChecker(req.payload.id, req.body.id, (message) => {
    res.json(message);
  });
});

router.post("/document/checkout", auth.required, async (req, res, next) => {
  const isCheckedOut = await DocumentCheckout.findOne({
    where: { isReturned: false, documentId: req.body.documentId },
  });
  if (isCheckedOut) {
    if (req.body.isReturned) {
      await DocumentCheckout.update({ isReturned: true }, { where: { id: isCheckedOut.id } });
      auditDocument(req.body.documentId, req.payload.id, DocumentAuditModel.CheckIn);
      res.send({ success: true, message: "Successful!" });
    } else {
      res.send({ success: false, message: "Document already checked out!" });
    }
  } else {
    DocumentCheckout.create(req.body)
      .then((_) => {
        auditDocument(req.body.documentId, req.payload.id, DocumentAuditModel.CheckOut);

        res.send({ success: true, message: "Successful!" });
      })
      .catch((err) => {
        logger.error(err);
        res.status(500).send("Error!");
      });
  }
});

router.get("/document/:id", auth.required, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Associations
    Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
    Document.hasMany(DocumentAudit);
    Document.hasMany(DocumentAccessUser);
    Document.hasMany(DocumentCheckout);
    Document.hasMany(HourlyAccess);
    Document.hasMany(DocumentIndexValue);
    Document.hasMany(Favourite);
    Document.belongsToMany(DocumentTypeIndex, { through: DocumentIndexValue });

    // Find the document with associated data
    const doc = await Document.findOne({
      where: { id },
      include: [
        {
          model: DocumentAudit,
          limit: 15,
          required: false,
        },
        {
          model: DocumentAccessUser,
          required: false,
        },
        {
          model: DocumentCheckout,
          required: false,
        },
        {
          model: Attachment,
          where: { isDeleted: false, redaction: false, itemType: "document" },
          required: false,
        },
        {
          model: HourlyAccess,
          where: {
            validTill: {
              [Op.gt]: Date.now(),
            },
          },
          required: false,
        },
        {
          model: DocumentIndexValue,
          required: false,
        },
        {
          model: DocumentTypeIndex,
          required: false,
        },
        {
          model: Favourite,
          required: false,
        },
      ],
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    if (doc.isDeleted && !isSuperAdmin(req.payload)) {
      return res.json({ success: false, message: "You cannot access this document!" });
    }

    const approvedLog = await execSelectQuery(`
      SELECT da.*, u.email FROM document_audits da
      JOIN users u ON u.id = da.accessedBy
      WHERE accessType = 'Approve' AND documentId = ${id}`);

    let documentAttachments = await execSelectQuery(documentAttachment(id, req.payload));

    const makerOrChecker = await execSelectQuery(`
      SELECT * FROM approval_masters am
      WHERE am.isActive = 1 AND am.documentId = ${id}`);

    const userIsChecker = req.payload.id === makerOrChecker[0]?.assignedTo;
    const userIsMaker = req.payload.id === makerOrChecker[0]?.initiatorId;

    if (doc.sendToChecker && userIsMaker) {
      return res.json({ success: false, message: "Document has been sent to checker. You cannot access this document!" });
    }

    const attachmentFilter = userIsChecker || userIsMaker || isSuperAdmin(req.payload);

    if (typeof documentAttachments === "object" && !attachmentFilter) {
      documentAttachments = documentAttachments.filter((row) => !row.pendingApproval || row.createdBy === req.payload.id);
    }

    const attachmentMakerChecker = await queryAttachmentMakerChecker(id);
    const pendingApprovalAttachments = await queryPendingApprovalAttachments(id);

    var docTags = [];

    docTags = docTags.map((tag) => tag.value);
    const data = await canViewTheDocument(req.payload.id, [doc]);

    if (data[0]) {
      await auditDocument(id, req.payload.id, DocumentAuditModel.OPEN);

      function structureAttachment(attachments) {
        var showInAttachment = [];
        var associatedBokIdsVar = [];

        attachments.map((attach) => {
          if (attach?.isShownInAttachment)
            showInAttachment.push({
              id: attach.id,
              indexValueId: attach.indexValueId,
              label: attach.label,
              value: attach.value,
              dataType: attach?.dataType,
            });
        });

        const result = _.uniqBy(attachments, "id");

        return { data: result, showInAttachment };
      }

      res.json({
        success: true,
        approvedLog,
        makerOrChecker: makerOrChecker[0],
        options_maker: { attachmentMakerChecker, pendingApprovalAttachments },
        data: data[0],
        associatedIds: [],
        docTags: [],
        attachments: structureAttachment(documentAttachments),
      });
    } else {
      res.json({ success: false, message: "You cannot access this document!" });
    }
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/**
 * tritter OTP send code
 */
router.post("/document/otp-send", auth.required, async (req, res, next) => {
  handleOTPSend(req);
  res.send({ success: true, message: "OTP Send Sucessfully" });
});

/**
 * trigger scan trigger
 */

router.post("/document/ocr-scan", auth.required, async (req, res, next) => {
  await Axios.get("http://localhost:9999/");
  res.send({ success: true, message: "opening scan application." });
});

//Archived Now route
router.post("/document/doc-archive", auth.required, async (req, res, next) => {
  const id = req.body.documentId;

  // validate user is in same domain
  const message = await validateUserIsInSameDomain(req.payload, id);
  if (message) return res.send({ success: false, message });

  const data = await getDocument(id);
  if (!data?.dataValues?.isApproved) return res.send({ succes: false, message: "Document is not Approved" });

  await Document.update({ isArchived: true }, { where: { id } });
  res.send({ success: true, message: "Document Archived Successfully." });
});

router.put("/document", validator(DocsEdit), auth.required, async (req, res, next) => {
  let body = req.body;

  // To maintain log
  let log_query;

  const { id } = body;

  // validate user is in same domain
  const message = await validateUserIsInSameDomain(req.payload, id);
  if (message) return res.send({ success: false, message });

  body.editedBy = req.payload.id;
  const indexValues = body.document_index_values || [];
  const documentTags = body.tags || [];

  // if security level is selected null then  send null data
  body.securityLevel = body.securityLevel == "" ? null : body.securityLevel;

  // dispoosal date to null
  if (body.disposalDate == "Invalid date" || body.disposalDate == "" || body.disposalDate == undefined)
    body.disposalDate = null;

  if (body?.departmentId) body.branchId = null;
  else if (body?.branchId) body.departmentId = null;
  else if (body?.hierarchy) {
    const hierarchy = await SecurityHierarchy.findOne({ where: { code: body.hierarchy } });

    if (hierarchy.departmentId) {
      body.branchId = null;
      body.departmentId = hierarchy.departmentId;
    } else if (hierarchy.branchId) {
      body.departmentId = null;
      body.branchId = hierarchy.branchId;
    }
  }

  // To maintain log
  const previousValue = await findPreviousData(constantLogType.DOCUMENT, id, req.method);

  Document.update(body, {
    // To maintain log
    logging: (sql) => (log_query = sql),
    raw: true,
    where: { id: id },
  })
    .then((_) => {
      indexValues.map((item) => {
        if (item.id) {
          DocumentIndexValue.update(item, {
            where: { id: item.id },
          }).catch((err) => {
            console.log(err);
          });
        } else {
          DocumentIndexValue.create({ ...item, documentId: id }).catch((err) => {
            console.log(err);
          });
        }
      });

      // to delete the tags of a document
      Promise.all(
        documentTags.map(async (tag) => {
          await Tag.destroy({
            where: { docId: id, label: "tag" },
          });
        })
      );

      // Recreating the updated tags
      Promise.all(
        documentTags.map(async (tag) => {
          await Tag.create({
            ...tag,
            docId: id,
            value: tag,
            label: "tag",
          });
        })
      );

      sendToUser(id);
      const userList = body?.userAccess || [];
      updateUserAccess(id, userList, () => {
        auditDocument(id, req.payload.id, DocumentAuditModel.UPDATE);
        // To maintain log
        createLog(req, constantLogType.DOCUMENT, id, log_query, previousValue);
        // end
        res.json({
          success: true,
          message: "Document successfully updated!",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.delete("/document/:id", auth.required, async (req, res, next) => {
  const { id } = req.params;

  // validate user is in same domain
  const message = await validateUserIsInSameDomain(req.payload, id);
  if (message) return res.send({ success: false, message });

  let isMaker = false;
  // for log
  let log_query;

  // find checker or not
  const data = await getDocument(id);
  // for maker => user can delete their documents.
  if (typeof data == "object") {
    if ((!data.sendToChecker || data.returnedByChecker === true) && data.createdBy == req.payload.id) {
      isMaker = true;
    }
  }
  // To maintain log
  const previousValue = await findPreviousData(constantLogType.DOCUMENT, id, req.method);

  deleteItem(
    Document,
    {
      id: id,
      type: DOCUMENT,
      isMaker,
    },
    req.payload,
    async (response) => {
      //attachments related to the document are also deleted
      if (response?.success) {
        await Attachment.update(
          { isDeleted: true },
          {
            // for log
            logging: (sql) => (log_query = sql),
            raw: true,
            where: { itemId: id },
          }
        );
        const approval_master = await execSelectQuery(
          `select * from approval_masters am where documentId =${id} and type='document'`
        );

        if (data.returnedByChecker) {
          await sendEmailDocumentDelete(req.payload.id, approval_master[0]?.assignedTo, id);
        }

        // for log
        createLog(req, constantLogType.DOCUMENT, id, log_query, previousValue);
      }
      res.send(response);
    },
    req
  );
});

router.get("/bok-lms", async (req, res, next) => {
  const { id, attachmentModalBata } = req.query;

  const data = await sequelize.query(getBOKIDs(id, attachmentModalBata), {
    type: Sequelize.QueryTypes.SELECT,
  });

  res.send({ data, success: true });
});

// verify BOKID is valid or not
async function handleVerifyBOKID(id) {
  const data = await sequelize.query(verifyBOKID(id), {
    type: Sequelize.QueryTypes.SELECT,
  });
  return data[0].total >= 1 ? true : false;
}

router.get("/bok-cbs", async (req, res, next) => {
  const { id } = req.query;
  if (id == "") return;

  // const hasBokId = await handleVerifyBOKID(id);
  // if (hasBokId) {
  //   res.send({ success: false });
  // }

  const data = await sequelize.query(getBOKIDsCBS(id, false), {
    type: Sequelize.QueryTypes.SELECT,
  });

  // if (data.length === 0) {
  //   res.send({ message: "CBS doesnot contain " + id, success: false });
  //   return;
  // const lmsData = await sequelize.query(getBOKIDs(id), {
  //   type: Sequelize.QueryTypes.SELECT,
  // });

  res.send({ data: data, success: true });
});

router.get("/bok-cbs/pullBOKIDaFromCBS", async (req, res, next) => {
  const { id } = req.query;
  if (id == "") return;

  // const hasBokId = await handleVerifyBOKID(id);
  // if (hasBokId) {
  //   res.send({ success: false });
  // }

  let data = await sequelize.query(getBOKIDsCBS(id, false), {
    type: Sequelize.QueryTypes.SELECT,
  });
  const newData = data.map((row) => {
    return { ...row, BOKID: row.BOK_ID, CustName: row.GROUP_NAME };
  });

  // if (data.length === 0) {
  //   res.send({ message: "CBS doesnot contain " + id, success: false });
  //   return;
  // }
  // const lmsData = await sequelize.query(getBOKIDs(id), {
  //   type: Sequelize.QueryTypes.SELECT,
  // });

  res.send({ data: newData, success: true });
});

//Everest Bank : Print QR Data (AccountHolderName and Account Number) in range
router.get("/document-range", async (req, res, next) => {
  const first = req.query.first;
  const second = req.query.second;

  let data = [];
  const allDocument = await execSelectQuery(
    `SELECT * FROM documents d 
    WHERE d.NAME BETWEEN  CAST('${first}' as varchar(14)) AND CAST('${second}' as varchar(14)) 
    AND d.isDeleted =0 order by d.name asc;`
  );
  allDocument.forEach((arr) => {
    data.push(arr.otherTitle.toString());
  });

  const accountNumbers = data.map((item) => item.match(/^\d+/)[0]);

  const excelDumpData = await execSelectQuery(excelData(accountNumbers));

  const separatedData = excelDumpData.map((entry, index) => {
    const accountNumber = entry.DocumentName.substring(0, 14);
    const accountName = entry.DocumentName.substring(14).trim();

    return {
      S_N: index + 1,
      Account_Number: accountNumber,
      Account_Name: accountName,
      Remarks: "",
    };
  });

  // console.log(data, "data");
  let charCount = allDocument.toString().length;

  // console.log(charCount, "count");

  if (charCount < 1850) {
    return res
      .status(200)
      .json({ accountInformation: [...new Set(data)], excelInformation: separatedData ? separatedData : [] });
  }
  return res.status(200).json({ accountInformation: [], success: false });
});

//can be turned in to module
// const filterArray = (arr, first, second) => {
//   //Output account numbers from otherTitle
//   let resultant = arr.map((v) => {
//     return v.substring(0, 14);
//   });

//   //Checks if account nubmers are present in resultant array
//   if (resultant.includes(first) && resultant.includes(second)) {
//     let a = arr.filter((item) => (first <= item && item <= second) || (second <= item && item <= first));
//     return a;
//   }
//   return console.log("No Data Found");
// };

//Reporting Section

// router.get("/get-reporting-iframe", auth.required, async (req, res) => {
//   const reportingFrame = await execSelectQuery("select * from reporting_iframes");
//   if (!reportingFrame) {
//     return res.status(404).json({});
//   }
//   res.status(200).json({ reportingFrame });
// });

const METABASE_SITE_URL = "https://dms.ebl.com.np:8443";
const METABASE_SECRET_KEY = "357a9ecaa1c73ccd29c29b8110da66a5ee29d9099143253fb9a2c4ec4b80d217";

router.get("/get-reporting-iframe", auth.required, async (req, res) => {
  try {
    // Expiration time: 1 minute (60 seconds) from now
    const expirationTime = Math.floor(Date.now() / 1000) + 300;

    const payload = {
      resource: { dashboard: 164 },
      params: {},
      exp: expirationTime, // Adding expiration claim
    };

    const payload1 = {
      resource: { dashboard: 165 },
      params: {},
      exp: expirationTime, // Adding expiration claim
    };

    // Signing JWT tokens with expiration
    const token = jwt.sign(payload, METABASE_SECRET_KEY, { algorithm: "HS256" });
    const token1 = jwt.sign(payload1, METABASE_SECRET_KEY, { algorithm: "HS256" });

    // Sample response structure
    const reportingFrame = [
      {
        id: 1,
        isDeleted: "0",
        url: `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`,
        name: "DOCUMENT DASHBOARD",
        isTitled: 1,
      },
      {
        id: 2,
        isDeleted: "0",
        url: `${METABASE_SITE_URL}/embed/dashboard/${token1}#bordered=true&titled=true`,
        name: "LOGS DASHBOARD",
        isTitled: 1,
      },
    ];

    res.status(200).json({ reportingFrame });
  } catch (error) {
    console.error("Error generating Metabase token:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// router.get("/metalink", auth.required, async (req, res) => {
//   var METABASE_SITE_URL = "https://dms.ebl.com.np:8443";
//   var METABASE_SECRET_KEY = "357a9ecaa1c73ccd29c29b8110da66a5ee29d9099143253fb9a2c4ec4b80d217";

//   var payload = {
//     resource: { dashboard: 354 },
//     params: {},
//   };

//   var payload1 = {
//     resource: { dashboard: 322 },
//     params: {},
//   };

//   var token = jwt.sign(payload, METABASE_SECRET_KEY);
//   var token1 = jwt.sign(payload1, METABASE_SECRET_KEY);

//   var iframeUrl = [
//     METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true",
//     METABASE_SITE_URL + "/embed/dashboard/" + token1 + "#bordered=true&titled=true",
//   ];

//   res.status(200).json({ iframeUrl });
// });

router.get("/metalink", auth.required, async (req, res) => {
  try {
    // Expiration time: 1 minute (60 seconds) from now
    const expirationTime = Math.floor(Date.now() / 1000) + 300;

    const payload = {
      resource: { dashboard: 354 },
      params: {},
      exp: expirationTime, // Adding expiration claim
    };

    const payload1 = {
      resource: { dashboard: 322 },
      params: {},
      exp: expirationTime, // Adding expiration claim
    };

    // Signing JWT tokens with expiration
    const token = jwt.sign(payload, METABASE_SECRET_KEY, { algorithm: "HS256" });
    const token1 = jwt.sign(payload1, METABASE_SECRET_KEY, { algorithm: "HS256" });

    // Construct secure iframe URLs
    const iframeUrl = [
      `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`,
      `${METABASE_SITE_URL}/embed/dashboard/${token1}#bordered=true&titled=true`,
    ];

    res.status(200).json({ iframeUrl });
  } catch (error) {
    console.error("Error generating Metabase token:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.get("/indexing-everest", async (req, res) => {
  const documents = await execSelectQuery(`
  SELECT * from documents 
WHERE id not in (
SELECT DISTINCT div.documentId
from document_index_values div
group by div.documentId
)
and isDeleted=0 and isApproved=1 and isArchived=0`);

  const already_indexed = await execSelectQuery(`
    select DISTINCT d.name from documents d
    join document_types dt on dt.id =d.documentTypeId 
    join document_indices di on di.docId =dt.id
    join document_index_values div on div.documentId =d.id 
    WHERE d.name != '' and d.isDeleted =0
    `);

  for (const row of documents) {
    const revaulate = already_indexed.map((row) => row.name);
    if (revaulate.includes(row.name)) {
      // console.log("=============  Skip process   ==================");
      continue;
    }

    // console.count(row.id, row.name);
    console.log("=============  indexing process start  ==================");
    //hit api
    try {
      // http://10.1.13.22:8080/api/schm?acct=${acNo}
      // https://check.ebl-zone.com/api/schm?acct=${accNo}
      const url = `https://check.ebl-zone.com/api/schm?acct=${row.name}`;
      const response = await axios.get(url, {
        auth: {
          username: "docudigi",
          password: "31Py5X#r",
        },
      });

      const result = response?.data;
      // console.log(result);
      // const result = {
      //   acct: "01606017200025",
      //   acctName: "DIBAKAR GAUTAM",
      //   custId: "000447422",
      //   branch: "POKHARA BRANCH",
      //   schmCode: "ODSST",
      //   idNum: "39/8/889/044",
      // };

      // insert indexed

      const data = Object.entries(result);

      const resolvePromisesSeq = async (tasks, path) => {
        await tasks.reduce(async (acc, [key, value]) => {
          // wait for previous action to complete
          await acc;
          const api_result = {
            cct: 1,
            custId: 2,
            acctName: 3,
            branch: 4,
            schmCode: 5,
            idNum: 6,
          };

          if (api_result?.[key]) {
            //Insert into database
            // console.log("inserted,:", value);
            await DocumentIndexValue.create({
              documentIndexId: api_result?.[key],
              value: typeof value == "object" ? JSON.stringify(value) : value,
              documentId: row.id,
            })
              .then()
              .catch((err) => {
                // console.log("Index Error", err);
                exit(1);
              });
          }
        }, Promise.resolve());
      };

      await resolvePromisesSeq(data);
      console.log("=============  indexing process end  ==================");
    } catch (error) {
      // console.log(row.name);
      writeToFile(row.name, "bulkupload_error.txt", true);
      // console.log(error);

      continue;
    }
  }

  res.status(200).json({ success: true });
});

router.post("/all-branch-data", async (req, res) => {
  try {
    const apiUrl = "http://10.1.3.49:9999/all-branch-data" || process.env.SERVER_URL_BRANCH_DATA;
    const requestData = {
      functionName: "AOFCountSolWise",
      requestData: {
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
      },
    };
    const response = await axios.post(apiUrl, requestData);
    const apiData = response.data.QueryResult;

    const result = [];

    for (const branchData of apiData) {
      const { AOF_OPENED_IN_FINACLE, ACCT_NO_LIST, BRANCHNAME, BRANCHID } = branchData;
      // Ignore branch code 0000
      if (BRANCHID === "0000") {
        continue;
      }
      const accountList = ACCT_NO_LIST.split(",").map((account) => account.trim());

      const branch = await Branch.findOne({ where: { branchCode: BRANCHID } });
      if (!branch) {
        throw new Error(`Branch with code ${BRANCHID} not found in the database`);
      }

      const documents = await Document.findAll({
        where: {
          name: { [Op.in]: accountList },
          isDeleted: 0,
          isApproved: 1,
        },
      });

      const existingAccounts = documents.map((doc) => doc.name);
      const AOF_OPENED_IN_SYSTEM = existingAccounts.length;

      const nonExistingAccounts = accountList.filter((account) => !existingAccounts.includes(account));
      const AOF_NOT_IN_DMS = nonExistingAccounts.join(", ");

      result.push({
        SN: result.length + 1,
        BRANCH_NAME: BRANCHNAME,
        AOF_OPENED_IN_FINACLE: AOF_OPENED_IN_FINACLE,
        AOF_OPENED_IN_SYSTEM: AOF_OPENED_IN_SYSTEM,
        // AOF_NOT_IN_DMS: AOF_NOT_IN_DMS,
      });
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching and formatting data:", error);
    res.status(500).json({ error: "Failed to fetch and format data" });
  }
});

router.get("/document-account-number/:accountNumber", auth.required, async (req, res, next) => {
  const { accountNumber } = req.params;

  // Validate account number length and that it's numeric
  if (!/^\d{14}$/.test(accountNumber)) {
    res.json({ success: false, message: "Invalid Account Number. Must be 14 digits." });
    return;
  }

  try {
    // Parameterized query to prevent SQL injection
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
        doc.name = ?
        AND att.isDeleted = 0
        AND doc.isDeleted = 0
      `,
      [accountNumber]
    );

    if (document.length === 0) {
      res.status(404).json({ success: false, message: "No document found for provided account number" });
      return;
    }

    res.json({ success: true, data: document });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
