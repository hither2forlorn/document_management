const router = require("express").Router();
const crypto = require("crypto");
const NepaliDate = require("nepali-date-converter");
const moment = require("moment-timezone");

// const adbs = require('ad-bs-converter');
// const oracledb = require("oracledb");
//AUTHENTICATION
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { deleteItem, DOCUMENT } = require("../../config/delete");
const { canViewTheDocument } = require("../auth");
//DATABASE
const Fuse = require("fuse.js");
var jwt = require("jsonwebtoken");
// For BOK CBS oracle database
// const connection = require("../../config/oracle");
const {Op} = require('sequelize');
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
  District,
  Role,
  ApprovalQueue,
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
const { Docs } = require("../../validations/docs");
const { DocsEdit } = require("../../validations/docs");
const { documentAttachment, associatedBokIdFromTags, docTagSearch } = require("../sqlQuery/attachment");
const { handleOTPSend } = require("../../util/OTP/otpSend");
const { execSelectQuery, execUpdateQery, execInsertQuery } = require("../../util/queryFunction");
const { getDocument } = require("../util/getModelDetail");
const { default: Axios, default: axios } = require("axios");
const { sendOtpAccessInfoToOwner } = require("../security-level/3");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { consoleLog } = require("../../util");
const { queryAttachmentMakerChecker, queryPendingApprovalAttachments } = require("../sqlQuery/documentMakerChecker");
const isSuperAdmin = require("../sqlQuery/isSuperAdmin");
const { edit_delete_document, validateUserIsInSameDomain } = require("../middleware/edit_delete_document");

function auditDocument(documentId, userId, accessType, type, message) {
  DocumentAudit.create({
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
  sendMessage(documentUpdateTemplate(owner, editor ? editor : {}, doc));
}

router.post("/document", [validator(Docs), auth.required], auth.required, async (req, res, next) => {
  const errors = validationResult(req);
  let log_query;
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors });
  }

  req.body.isDeleted = false;
  req.body.ownerId = req.payload.id;
  req.body.createdBy = req.payload.id;
  req.body.editedBy = req.payload.id;
  req.body.returnedByChecker = false;
  req.body.hierarchy = req.body.hierarchy || req.payload?.hierarchy || null;
  req.body.branchId = req.payload?.branchId || null;
  req.body.departmentId = req.body.departmentId || req.payload?.departmentId || null;
  req.body.notification = req.body.notification || null; // Set a default if needed
  req.body.notificationUnit = req.body.notificationUnit || null;

  if (req.body.disposalDate) {
    const date2 = new Date(req.body.disposalDate); // Incoming date (likely from the frontend)
    const date3 = new NepaliDate(date2); // Convert the incoming date to Nepali date
    const bsDate = date3.getBS(); // Get Nepali date

    // Adjust month for Nepali calendar (Nepali months are 1-indexed)
    bsDate.month = bsDate.month + 1;

    const { year, month, date } = bsDate;

    // Create the new Nepali formatted date (without converting to ISO)
    // const formattedDate = `${year}-${month}-${date}`;
    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

    // Create a moment object from formatted Nepali date, setting current time
    const currentDate = moment(); // Get current time in local time zone
    const dateWithTime = moment.utc(formattedDate).set({
      hour: currentDate.hour(),
      minute: currentDate.minute(),
      second: currentDate.second(),
      millisecond: currentDate.millisecond(),
    });

    // Convert the date to Kathmandu time zone (Asia/Kathmandu)
    const kathmanduTime = dateWithTime.tz("Asia/Kathmandu").format("YYYY-MM-DD HH:mm:ss");

    // Assign the formatted Kathmandu date to the body
    req.body.disposalDateNP = kathmanduTime;
  }

  // Security hierarchy removed for rbb so manually added for future use
  // if (onlyForThisVendor(banks.rbb.name)) req.body.securityLevel = 2;

  const indexValues = req.body.document_index_values || [];
  const documentTags = req.body.tags || [];
  if (req.body.checker) {
    req.body.isApproved = false;
  } else {
    req.body.isApproved = false;
  }
const role = await Role.findOne({
  attributes: ['name'],
  where: {
    id: req.payload.roleId
  }
});
  if (role[0]?.name === "System") {
    req.body.isApproved = true;
  }
  Document.create(req.body, {
    logging: (sql) => (log_query = sql),
    raw: true,
  })
    .then(async (doc) => {
      indexValues.map((item) => {
        DocumentIndexValue.create({ ...item, documentId: doc.id }).catch((err) => {
          console.log("Index Error", err);
        });
      });
      if (!doc.isApproved) addChecker(doc);

      // creating the new a new document tags
      Promise.all(
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

router.get("/document/pagination", auth.required, async (req, res, next) => {
  req.query.userId = req.payload.id;
  let paginationDocument = await execSelectQuery(paginateQuery(req.query, false, req.payload));
  paginationDocument = paginationDocument?.filter((doc) => doc.isApproved === true);
  // For branch-specific users (when branchId exists and not admin)
  if (req.payload.branchId && req.payload.roleId !== 1) {
    const userBranch = await execSelectQuery(
      `SELECT name FROM branches WHERE id = ${req.payload.branchId}`
    );
    if (userBranch.length > 0) {
      const branchName = userBranch[0].name;
      paginationDocument = paginationDocument.filter(doc => doc.Branch === branchName);
    } else {
      paginationDocument = [];
    }
  } else {
    // For department-level users, filter branch documents based on allowed branches.
    // Fetch allowed branch names for the user's department.
    const allowedBranches = await getAssociatedBranches(req.payload.departmentId);
    const allowedBranchNames = allowedBranches.map(b => b.name);
    // Filter the documents: if a document has a non-null Branch, ensure it is in the allowed list.
    paginationDocument = paginationDocument.filter(doc => {
      // If Branch is null, assume it's a department-level document.
      if (doc.Branch === null || doc.Branch === undefined) return true;
      return allowedBranchNames.includes(doc.Branch);
    });
  }

  const totalDocument = await execSelectQuery(paginateQuery(req.query, true, req.payload));
  res.send({
    paginationDocument,
    total: totalDocument[0]?.total,
    success: true,
  });
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
    notification,
    notificationUnit,
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

router.get("/document/restore/:id", auth.required, async (req, res, next) => {
  const id = req.params.id;
  console.log("id", id);
  const document = await Document.findOne({ where: { id: id } });

  if (document) {
    document.isDeleted = false;
    document.save();
    res.json({ success: true, message: "Document successfully restored!" });
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

router.get("/document/notification", auth.required, async (req, res) => {
  const userId = req.payload.id;

  // Subquery to calculate isExpiring and isExpired for reuse
  const subqueryForNotifications = `
    SELECT 
      d.*, 
      am.initiatorId,
      am.assignedTo,
      am.approverId,
      CASE 
        WHEN d.disposalDate IS NULL THEN 0
        WHEN 
          (
            (d.notificationUnit = 'hr' AND DATEDIFF(HOUR, GETDATE(), d.disposalDate) BETWEEN 0 AND 2) OR
            (d.notificationUnit = 'day' AND DATEDIFF(DAY, GETDATE(), d.disposalDate) BETWEEN 0 AND 2) OR
            (d.notificationUnit = 'week' AND DATEDIFF(WEEK, GETDATE(), d.disposalDate) BETWEEN 0 AND 1)
          )
        THEN 1 ELSE 0
      END AS isExpiring,
      CASE 
        WHEN d.disposalDate IS NULL THEN 0
        WHEN 
          (
            (d.notificationUnit = 'hr' AND DATEDIFF(HOUR, GETDATE(), d.disposalDate) <= 0) OR
            (d.notificationUnit = 'day' AND DATEDIFF(DAY, GETDATE(), d.disposalDate) <= 0) OR
            (d.notificationUnit = 'week' AND DATEDIFF(WEEK, GETDATE(), d.disposalDate) <= 0)
          )
        THEN 1 ELSE 0
      END AS isExpired,
      CASE 
        WHEN d.disposalDate IS NULL THEN CONCAT('Document notification unit: ', d.notificationUnit)
        WHEN 
          (
            (d.notificationUnit = 'hr' AND DATEDIFF(HOUR, GETDATE(), d.disposalDate) BETWEEN 0 AND 2) OR
            (d.notificationUnit = 'day' AND DATEDIFF(DAY, GETDATE(), d.disposalDate) BETWEEN 0 AND 2) OR
            (d.notificationUnit = 'week' AND DATEDIFF(WEEK, GETDATE(), d.disposalDate) BETWEEN 0 AND 1)
          )
        THEN CONCAT('Document is expiring soon (Expiry date: ', FORMAT(d.disposalDate, 'yyyy-MM-dd HH:mm:ss'), ')')
        WHEN 
          (
            (d.notificationUnit = 'hr' AND DATEDIFF(HOUR, GETDATE(), d.disposalDate) <= 0) OR
            (d.notificationUnit = 'day' AND DATEDIFF(DAY, GETDATE(), d.disposalDate) <= 0) OR
            (d.notificationUnit = 'week' AND DATEDIFF(WEEK, GETDATE(), d.disposalDate) <= 0)
          )
        THEN 'Document expired'
        ELSE CONCAT('Document will expire in ', d.notificationUnit, ' (', FORMAT(d.disposalDate, 'yyyy-MM-dd HH:mm:ss'), ')')
      END AS expiryMessage
    FROM documents d
    JOIN approval_masters am ON am.documentId = d.id
    WHERE d.isDeleted = 0 AND d.isArchived = 0
  `;

  // Main query to handle notifications
  const mainQuery = `
    SELECT * 
    FROM (${subqueryForNotifications}) AS notifications
    WHERE 
      (notifications.isExpiring = 1 OR notifications.isExpired = 1) OR
      (
        notifications.isApproved = 0 AND
        notifications.isDeleted = 0 AND
        notifications.isArchived = 0 AND
        (
          ((notifications.returnedByChecker  = 1 OR notifications.returnedByApprover = 1) AND notifications.initiatorId = ${userId}) OR
          (notifications.sendToApprover = 1 AND notifications.approverId = ${userId}) OR
          
          (
          (notifications.returnedByApprover = 1 AND notifications.assignedTo = ${userId}) AND
          NOT (notifications.returnedByChecker = 1) 
           ) OR
          ( 
          (notifications.sendToChecker = 1 AND notifications.assignedTo = ${userId}) AND
           NOT (notifications.sendToApprover = 1) 
          )
        )
      )
    ORDER BY notifications.createdAt DESC
  `;

  // Count query for total notifications
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM (${subqueryForNotifications}) AS notifications
    WHERE
      (notifications.isExpiring = 1 OR notifications.isExpired = 1) OR
      (
        notifications.isApproved = 0 AND
        notifications.isDeleted = 0 AND
        notifications.isArchived = 0 AND
        (
          (notifications.returnedByApprover = 1 AND notifications.initiatorId = ${userId}) OR
          (notifications.sendToApprover = 1 AND notifications.approverId = ${userId}) OR
          (
          (notifications.returnedByApprover = 1 AND notifications.assignedTo = ${userId}) AND
          NOT (notifications.returnedByChecker = 1) 
           ) OR

          
         ( 
          (notifications.sendToChecker = 1 AND notifications.assignedTo = ${userId}) AND
           NOT (notifications.sendToApprover = 1) 
          )
        )
      )  
  `;

  try {
    const paginationDocument = await execSelectQuery(mainQuery);
    const totalDocument = await execSelectQuery(countQuery);

    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      user: req.payload,
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "An error occurred while fetching notifications.", error: err });
  }
});

router.get("/document/pending-pagination", auth.required, async (req, res, next) => {
  req.query.userId = req.payload.id;

  try {
    // Check if the user has Department Admin access (roleTypeId = 22)
   const roleQuery = `
  SELECT rc.roleTypeId
  FROM users u
  INNER JOIN role_controls rc ON u.roleId = rc.roleId
  WHERE u.id = ${req.query.userId} AND rc.roleTypeId = 22 AND rc.value = 'true'
`;

    let [roleResult] = await execSelectQuery(roleQuery);
    const hasRoleTypeId = roleResult?.roleTypeId ? true : false; // True if user is Department Admin

    // Fetch pending documents
    const paginationDocument = await execSelectQuery(getPendingDocument(req.query, (count = false), req.payload, hasRoleTypeId));
    const totalDocument = await execSelectQuery(getPendingDocument(req.query, (count = true), req.payload, hasRoleTypeId));

    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      user: req.payload,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

router.get("/document/rejected-pagination", auth.required, async (req, res, next) => {
  req.query.userId = req.payload.id;

  try {
    // Check if the user has Department Admin access (roleTypeId = 22)
    const roleQuery = `
      SELECT rc.roleTypeId
      FROM users u
      INNER JOIN role_controls rc ON u.roleId = rc.roleId
      WHERE u.id = ${req.query.userId} AND rc.roleTypeId = 22 AND rc.value = 'true'
    `;

    let [roleResult] = await execSelectQuery(roleQuery);
    const hasRoleTypeId = roleResult?.roleTypeId ? true : false; // True if user is Department Admin

    // Fetch rejected documents
    const paginationDocument = await execSelectQuery(getRejectedDocument(req.query, (count = false), req.payload, hasRoleTypeId));
    const totalDocument = await execSelectQuery(getRejectedDocument(req.query, (count = true), req.payload, hasRoleTypeId));

    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      user: req.payload,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

router.get("/document/saved-pagination", auth.required, async (req, res, next) => {
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
      const images = _?.filter(data[0].attachments, (a) => a.fileType.includes("image"));
      const isWatermark = await Watermark.findOne({
        where: { isActive: true },
      });
      await downloadAttachments(images, isWatermark, { email: req.payload.email });
      auditDocument(id, req.payload.id, DocumentAuditModel.OPEN);
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
      const images = _?.filter(data[0].attachments, (a) => a.fileType.includes("image"));
      const isWatermark = await Watermark.findOne({
        where: { isActive: true },
      });
      await downloadAttachments(images, isWatermark, { email: req.payload.email });
      auditDocument(id, 0, DocumentAuditModel.OPEN);
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
router.post("/document/hourly-access", auth.required, (req, res, next) => {
  const { attachmentId, documentId, durationInMillis, selectedUsers, previewUrl } = req.body;
  const { selectedEmails, otherUrl, type } = req.body;
  const token = crypto.randomBytes(32).toString("hex");
  const validTill = Date.now() + durationInMillis;
  Promise.all(
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
      ? selectedEmails.map((email) => {
          return Promise.all([
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
    redactedAttachment,
    redact,
  } = req.body;

  // let newAttachments = [];
  // newAttachments.push(redactedAttachment);
  // const attachments = newAttachments;

  let attachments;
  if (redact) {
    attachments = [redactedAttachment];
  } else if (!redact) {
    attachments = attachmentId;
  }
  const redactedAttachmentArray = attachments.map((ele) => ele.value);
  const redactedAttachmentId = redactedAttachmentArray.toString();
  console.log(redactedAttachmentId, "this is the id");

  // const attachments = attachmentId;
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
        console.log(value, "this is value");
        hourlyAccess_data = await HourlyAccess.create({
          userId: value?.userId,
          userEmail: value?.userEmail,
          attachmentId: redact ? redactedAttachmentId : "",
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
        console.log(attachmentId, "this is attachmentId");
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
  const approval_master = await ApprovalMaster.findAll({ where: { documentId: req.body.id, isActive: 1 } });
  if (approval_master.length > 1) return res.send({ message: "Error: Please Contact Administrator", success: false });

  if (approval_master[0].dataValues.documentId != req.body.id)
    return res.send({ message: "you have no right to approve the document", success: false });

  next();
}

router.post("/document/approve", auth.required, validateUserApprove, async (req, res, next) => {
  try {
    const { id, userInput } = req.body;

    if (!userInput || !id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    //updated for verifyBy
   if (userInput) {
  await Document.update(
    { verifyBy: userInput }, // values to update
    { where: { id } }        // condition
  );
}

    approveDocument(req.payload.id, req.body.id, (message) => {
      if (message.success) {
        auditDocument(req.body.id, req.payload.id, DocumentAuditModel.Approve, message.type);
      }
      res.json(message || "failed");
    });
  } catch (error) {
    console.log(error.message);
  }
});

// reject document
router.post("/document/archive", auth.required, (req, res, next) => {
  archiveDocument(req.payload.id, req.body.id, req.body.rejectReason, async (message) => {
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
    `update documents set sendToChecker=1, returnedByApprover=0 ${message ? `, description='${message}'` : ""}  where id =  ${id}`
  );

  const approval_master = await execSelectQuery(
    `select * from approval_masters am where documentId =${id} and type='document'`
  );

  await sendEmailMakerCheckerInit(document.ownerId, approval_master[0]?.assignedTo, id);

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

router.post("/document/send-to-approver", auth.required, async (req, res, next) => {
  const { id, message, checkerName, approverId } = req.body; // Add approverId from request
  try {
    // Check if the document exists and has been sent to the checker
    Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
    const document = await Document.findOne({
      where: { id, sendToChecker: 1 },
      include: {
        model: Attachment,
        attributes: ["name", "attachmentDescription"],
        where: { isDeleted: false },
        required: false,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or has not been sent by the checker.",
      });
    }

    // Check if there are attachments before sending to the approver
    if (document.attachments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add an attachment before sending to the approver.",
      });
    }

    // Update document status to mark it as sent to the approver
    // Replace all three execUpdateQery calls with this single ORM update
const updateData = {
  sendToApprover: 1,
  returnedByApprover: 0,
  checkedAt: new Date()
};

if (message) updateData.commentByChecker = message;
if (checkerName) updateData.checkedBy = checkerName;

await Document.update(updateData, {
  where: { id: id }
});

    // Retrieve or update the approval master for this document
   // Use findAll since you're expecting an array result
const approvalMasters = await ApprovalMaster.findAll({
  attributes: ['id', 'assignedTo'],
  where: {
    documentId: id,
    type: 'document'
  }
});

// Then use array destructuring like your original code
const [approvalMaster] = approvalMasters;

    if (approvalMaster) {
      // Update the approver assignment in approval_masters
   await ApprovalMaster.update(
  {
    approverId: approverId
  },
  {
    where: {
      id: approvalMaster.id
    }
  }
);
    } else {
      // Insert a new approval master if not already present - FIXED
   await ApprovalMaster.create({
  documentId: id,
  type: 'document',
  assignedTo: approverId,
  approvalId: approverId,
  createdAt: new Date(),
  updatedAt: new Date()
});
    }

    // Insert a new entry in `approval_queues` for the approver - FIXED
  await ApprovalQueue.create({
  approvalMasterId: approvalMaster.id,
  isActive: 1,
  level: 2,
  userId: approverId,
  isApprover: 1,
  createdAt: new Date(),
  updatedAt: new Date()
});

    // Log the action
    await createLog(req, constantLogType.DOCUMENT, id, `Document sent to approver by checker`);
    await sendEmailMakerCheckerInit(document.ownerId, approverId, id);

    return res.json({
      success: true,
      message: "Document successfully sent to approver",
    });
  } catch (error) {
    console.error("Error in sending document to approver:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the request.",
    });
  }
});

router.get("/document/attachment-versioning-by-id", async (req, res) => {
  try {
    let { documentId, name } = req.query;

    // Validate documentId
    documentId = parseInt(documentId, 10);
    if (isNaN(documentId)) {
      return res.status(400).json({ success: false, message: "Invalid documentId" });
    }

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const attachments = await Attachment.findAll({
      where: { itemId: documentId, name, isDeleted: 1 },
      order: [["updatedAt", "DESC"]],
    });

    if (!attachments.length) {
      return res.status(404).json({ success: false, message: "No attachments found" });
    }

    res.json({ success: true, data: attachments });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

router.post(
  "/document/send-attachment-to-checker-or-approver",
  auth.required,

  async (req, res, next) => {
    const { id, message, userId, sendToApprover } = req.body;

    if (sendToApprover) {
      // Code to send attachment to approver
      const document = await Document.findOne({
        where: { id, sendToChecker: 1 }, // Ensure it was already sent to checker
        include: {
          model: Attachment,
          attributes: ["name", "attachmentDescription"],
          where: { isDeleted: false },
          required: false,
        },
      });

      if (!document) {
        return res.json({
          success: false,
          message: "Document not found or has not been sent by the checker.",
        });
      }

      // Ensure attachments are present before sending to approver
      if (document.attachments.length === 0) {
        return res.json({
          success: false,
          message: "Please add attachment before sending to approver",
        });
      }

      // Update document status to reflect sending to approver
      await execUpdateQery(
        `UPDATE documents SET sendToApprover=1 ${message ? `, description='${message}'` : ""} WHERE id = ${id}`
      );

      // Insert a new entry in `approval_queues` for the approver
      await execInsertQuery(`
        INSERT INTO approval_queues (approvalMasterId, isActive, level, userId, isApprover, createdAt, updatedAt)
        VALUES (
          (SELECT id FROM approval_masters WHERE documentId = ${id} AND type = 'document'),
          1, 2, ${userId}, 1, GETDATE(), GETDATE()
        );
      `);

      // Update `approval_masters` to reflect that it's with the approver
      await execUpdateQery(`
        UPDATE approval_masters
        SET currentLevel = 2, assignedTo = ${userId}
        WHERE documentId = ${id} AND type = 'document';
      `);

      // Log the action
      await createLog(req, constantLogType.DOCUMENT, id, `Document sent to approver by checker with ID ${userId}`);

      res.json({
        success: true,
        message: "Document successfully sent to approver",
      });
    } else {
      // Code to send attachment to checker (existing code)
      const attachmentMakerChecker = await queryAttachmentMakerChecker(id);
      const pendingApprovalAttachments = await queryPendingApprovalAttachments(id);

      if (attachmentMakerChecker.length > 0) {
        return res.send({ success: false, message: "Already sent to checker." });
      }

      if (pendingApprovalAttachments.length <= 0) {
        return res.send({ success: false, message: "No Attachment Uploaded." });
      }

      let doc = await getDocument(id);

      doc.checker = [{ userId, isApprover: true }];
      doc.userId = userId;

      addChecker(doc, true);

      await execUpdateQery(
        `UPDATE documents SET sendToChecker=1 ${message ? `, description='${message}'` : ""} WHERE id = ${id}`
      );

      createLog(req, constantLogType.DOCUMENT, req.body.id, `Document sent to checker with ID ${userId}`);

      res.json({
        success: true,
        message: "Document sent to Checker",
      });
    }
  }
);

router.get("/document/users/approvers", auth.required, async (req, res) => {
  const { branchId } = req.query; // branchCode comes from frontend query parameter

  if (!branchId) {
    return res.status(400).json({ success: false, message: "branchCode is required" });
  }

  try {
    const approvers = await execSelectQuery(`
      SELECT
        users.id,
        users.username,
        users.email,
        users.name,
        users.phoneNumber,
        users.roleId,
        users.branchId,
        users.isActive,
        users.isDeleted,
        role_types.name AS roleName
      FROM users
      JOIN role_controls ON users.roleId = role_controls.roleId
      JOIN role_types ON role_controls.roleTypeId = role_types.id
      WHERE role_types.id = 21  -- Ensure only 'Approver' role_type is selected
        AND (users.branchId = '${branchId}' OR users.departmentId = '${branchId}')  -- Match by branchId
        AND users.isDeleted = 0
        AND users.isActive = 1
    `);
    if (approvers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No approvers found for the specified branch.",
      });
    }

    res.json({ success: true, approvers });
  } catch (error) {
    console.error("Error fetching approvers:", error);
    res.status(500).json({ success: false, message: "An error occurred while fetching approvers" });
  }
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

    console.log(pendingApprovalAttachments.length, "coutn");
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
      await Document.update({ statusId: req.body.statusId }, { where: { id: req.body.documentId } });

      await DocumentCheckout.update({ isReturned: true, statusId: req.body.statusId }, { where: { id: isCheckedOut.id } });
      auditDocument(req.body.documentId, req.payload.id, DocumentAuditModel.CheckIn);
      res.send({ success: true, message: "Successful!" });
    } else {
      res.send({ success: false, message: "Document already checked out!" });
    }
  } else {
    await DocumentCheckout.create(req.body)
      .then(async (_) => {
        await Document.update({ statusId: req.body.statusId }, { where: { id: req.body.documentId } });
        await auditDocument(req.body.documentId, req.payload.id, DocumentAuditModel.CheckOut);

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
  Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
  Document.hasMany(DocumentAudit);
  Document.hasMany(DocumentAccessUser);
  Document.hasMany(DocumentCheckout);
  Document.hasMany(HourlyAccess);
  Document.hasMany(DocumentIndexValue);
  Document.hasMany(DocumentIndexValue);
  Document.hasMany(Favourite);
  Document.belongsToMany(DocumentTypeIndex, { through: DocumentIndexValue });

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

  if (doc.isDeleted && !isSuperAdmin(req.payload)) {
    return res.json({ success: false, message: "You cannot access this document!" });
  }

  const approvedLog = await execSelectQuery(`
    SELECT da.*, u.email  from document_audits da
    join users u on u.id  =da.accessedBy
    where accessType ='Approve' and documentId =${id}`);

  // list attachment of this document
  let documentAttachments = await execSelectQuery(documentAttachment(id, req.payload));

  // TODO: add associated attachment to document
  // const associatedAttachment = await execSelectQuery(
  //   associatedAttachmentQuery(id)
  // );

  // user is maker or checker in approval cycle
  const makerOrChecker = await execSelectQuery(
    "select * from approval_masters am where am.isActive=1 and am.documentId=" + id
  );

  const userIsChecker = req.payload.id == makerOrChecker[0]?.assignedTo;
  const userIsMaker = req.payload.id == makerOrChecker[0]?.initiatorId;
  const userIsApprover = req.payload.id == makerOrChecker[0]?.approverId;

  if (doc.sendToChecker && userIsMaker) {
    return res.json({ success: false, message: "Document has been Send to checker. You cannot access this document!" });
  }

  const attachmentFilter = userIsChecker || userIsMaker || userIsApprover || isSuperAdmin(req.payload);

  // filter attachments for pending approval
  if (typeof documentAttachments == "object" && !attachmentFilter) {
    documentAttachments = documentAttachments?.filter((row) => !row.pendingApproval || row.createdBy == req.payload.id);
  }

  // list associated id's
  const associatedIds = await execSelectQuery(associatedBokIdFromTags(id, "docId"));

  // Send attachment to checker
  const attachmentMakerChecker = await queryAttachmentMakerChecker(id);
  const pendingApprovalAttachments = await queryPendingApprovalAttachments(id);

  // searching go document tags
  var docTags = await execSelectQuery(docTagSearch(id, "docId"));

  docTags = docTags.map((tag) => tag.value);
  const data = await canViewTheDocument(req.payload.id, [doc]);
  if (data[0]) {
    const images = _?.filter(data[0].attachments, (a) => a.fileType.includes("image") && !a.isCompressed);
    const isWatermark = await Watermark.findOne({
      where: { isActive: true },
    });

    // Download images when opening document in DMS, also for watermark
    await downloadAttachments(images, isWatermark, { email: req.payload.email });

    auditDocument(id, req.payload.id, DocumentAuditModel.OPEN);

    // this is the part for sending OTP code
    if (doc?.hasOtp) {
      const owner = await User.findOne({ where: { id: data[0].ownerId } });
      handleOTPSend(req);
      sendOtpAccessInfoToOwner(owner.email, req.payload.email, data);
    }

    // structure array for attchment show in table
    async function structureAttachment(attachments) {
      console.log(attachments);
      const districts = await District.findAll({ raw: true });
      var showInAttachment = [];
      var associatedBokIdsVar = [];
      // separeate or add index values in attachment.
      attachments.map((attach) => {
        if (attach?.isShownInAttachment)
          showInAttachment.push({
            id: attach.id,
            indexValueId: attach.indexValueId,
            label: attach.label,
            value:
              attach?.dataType == "district"
                ? districts.find((row) => row.id == attach.value)?.name || attach.value
                : attach.value,

            dataType: attach?.dataType,
          });
      });
      const result = _.uniqBy(attachments, "id");
      associatedBokIdsVar = _.uniqBy(associatedBokIdsVar, "value");

      // add index data to array.
      return { data: result, showInAttachment };
    }

    res.json({
      success: true,
      approvedLog,
      makerOrChecker: makerOrChecker[0],
      options_maker: { attachmentMakerChecker, pendingApprovalAttachments },
      data: data[0],
      associatedIds: associatedIds || [],
      docTags: docTags || [],
      // attachments: [...documentAttachments, ...associatedAttachment], // display at document view
      attachments: await structureAttachment(documentAttachments), // display at document view
    });
  } else {
    res.json({ success: false, message: "You cannot access this document!" });
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
  // find checker or not
  const data = await getDocument(id);
  // for maker => user can delete their documents.
  if (typeof data == "object") {
    if ((!data.sendToChecker || data.returnedByChecker === true) && data.createdBy == req.payload.id) {
      isMaker = true;
    }
  }

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

//Reporting Section
const ReportingIframe = require("../models/reporting_iframe");
const { exit } = require("process");
const { log } = require("console");
const getAssociatedBranches = require("../../util/getAssociatedBranches");

router.get("/get-reporting-iframe", async (req, res) => {
  const reportingFrame = await execSelectQuery("select * from reporting_iframes");
  if (!reportingFrame) {
    return res.status(404).json({});
  }
  res.status(200).json({ reportingFrame });
});

router.get("/metalink", async (req, res) => {
  var METABASE_SITE_URL = "http://localhost:3000";
  var METABASE_SECRET_KEY = "7eb7f2e69868bc71c877541712b629f953b0fbb3c4a674b83a006c7450be2f58";

  var payload = {
    resource: { dashboard: 7 },
    params: {},
  };
  var token = jwt.sign(payload, METABASE_SECRET_KEY);

  var iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true";
  res.status(200).json({ iframeUrl });
});

router.get("/find-duplicate", async (req, res) => {
  const result = {
    acct: "01606017200025",
    acctName: "DIBAKAR GAUTAM",
    custId: "000447422",
    branch: "POKHARA BRANCH",
    schmCode: "ODSST",
    idNum: Date.now(),
  };
  res.send({ data: result });
});

router.get("/indexing-everest", async (req, res) => {
  const documents = await execSelectQuery("select * from documents d where name != '' and isDeleted =0");

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
      console.log("=============  Skip process   ==================");
      continue;
    }

    console.count(row.id, row.name);
    console.log("=============  indexing process start  ==================");
    //hit api
    try {
      const url = "http://localhost:8181/api/find-duplicate" || `https://check.ebl-zone.com/api/schm?acct=${row.name}`;
      const response = await axios.get(url, {
        auth: {
          username: "docudigi",
          password: "31Py5X#r",
        },
      });

      const result = response?.data?.data;
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
            // await DocumentIndexValue.create({
            //   documentIndexId: api_result?.[key],
            //   value: typeof value == "object" ? JSON.stringify(item.value) : value,
            //   documentId: row.id,
            // })
            //   .then()
            //   .catch((err) => {
            //     console.log("Index Error", err);
            //     exit(1);
            //   });
          }
        }, Promise.resolve());
      };

      await resolvePromisesSeq(data);
      console.log("=============  indexing process end  ==================");
    } catch (error) {
      console.log(error);
      continue;
    }
  }

  res.status(200).json({ success: true });
});

module.exports = router;

router.get("/license-checker", async (req, res) => {
  const crypto = require("crypto");

  const key = Buffer.from("AE62B9D3-C1AF-46FC-9A41-2A794778", "utf8");
  const iv = Buffer.from("D9EAE402-AC9E-4D", "utf8");

  function decryptLicense(encryptedDate) {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedDate, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  const encryptedLicenseKey = process.env.LICENSE_KEY;
  const decryptedLicenseDate = new Date(decryptLicense(encryptedLicenseKey));
  const currentDateTime = new Date();

  const isLicenseValid = decryptedLicenseDate > currentDateTime;

  const formattedExpirationDate = decryptedLicenseDate.toISOString();

  const response = {
    isLicenseValid: isLicenseValid,
    licenseExpirationDate: formattedExpirationDate,
  };

  res.json(response);
});
