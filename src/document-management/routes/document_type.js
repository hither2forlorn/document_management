const router = require("express").Router();
const auth = require("../../config/auth");
const validator = require("../../util/validation");
const { deleteItem, DOCUMENT_TYPE } = require("../../config/delete");
const { DocumentType, SecurityHierarchy } = require("../../config/database");
const { documentTypeValidation, documentTypeValidationEdit } = require("../../validations/document_type");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { execSelectQuery } = require("../../util/queryFunction");
const isSuperAdmin = require("../sqlQuery/isSuperAdmin");
const { Op } = require("sequelize");
router.post("/document-type", validator(documentTypeValidation), auth.required, async (req, res, next) => {
  // To maintain log
  let log_query;
  const typename = req.body.name;

  // admin then set to CONSTANT else normal branch user create hierarchy
  req.body.hierarchy = isSuperAdmin(req.payload) ? req.body.hierarchy || "CONSTANT" : req.payload.hierarchy || "CONSTANT";

  req.body.parentId = req.body?.parentId == "" ? null : req.body?.parentId;

  const whereConditions = {
    isDeleted: 0,
    name: req.body?.name,
  };

  // Add parentId condition if provided and not empty string
  if (req.body?.parentId || req.body?.parentId === 0) {
    whereConditions.parentId = req.body.parentId;
  }

  // Add hierarchy condition if provided
  if (req.body?.hierarchy) {
    whereConditions.hierarchy = req.payload.id == 1 ? req.body.hierarchy || "CONSTANT" : req.payload?.hierarchy;
  }

  const checkDocTypeExists = await DocumentType.findAll({
    where: whereConditions,
  });

  if (checkDocTypeExists.length > 0) {
    return res.json({
      success: false,
      message: "Document type with this name exists!!",
    });
  }

  const checkDocTypeDeleteExists = await DocumentType.findOne({
    where: { isDeleted: true, name: typename },
  });

  if (checkDocTypeDeleteExists) {
    const updateData = { isDeleted: false, ...req.body };
    await DocumentType.update(updateData, {
      where: { name: typename, hierarchy: req.body.hierarchy },
    });
    return res.send({ success: true, message: "Successful!" });
  } else {
    console.log(req.body);
    const documentTypeRes = await DocumentType.create(req.body, {
      // To maintain log
      logging: (sql) => (log_query = sql),
      raw: true,
    });
    // To maintain log
    createLog(req, constantLogType.DOCUMENT_TYPES, documentTypeRes.id, log_query);
    return res.json({ success: true, message: "Successful!" });
  }
});

router.get("/document-type", auth.required, async (req, res, next) => {
  DocumentType.findAll({
    raw: true,
    where: { isDeleted: false },
  })
    .then((docs) => {
      res.json({ success: true, data: docs });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

//document-type from department
router.get("/document-type-by-department", auth.required, async (req, res, next) => {
  const { departmentId } = req.query;

  if (!departmentId) {
    return res.json({ success: false, message: "Department ID is required" });
  }

  try {
    const securityHierarchies = await SecurityHierarchy.findAll({
      attributes: ["code"],
      where: {
        departmentId: departmentId,
        isDeleted: false,
      },
      raw: true,
    });

    const codes = securityHierarchies.map((sh) => sh.code);

    // Get both data and count
    const [documentTypes, totalCount] = await Promise.all([
      DocumentType.findAll({
        attributes: ["id", "name"],
        where: {
          hierarchy: { [Op.in]: codes },
          isDeleted: false,
        },
        raw: true,
      }),
      DocumentType.count({
        where: {
          hierarchy: { [Op.in]: codes },
          isDeleted: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: documentTypes,
      totalCount: totalCount,
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Error!" });
  }
});

router.get("/document-type/:id", auth.required, (req, res, next) => {
  // To maintain log
  let log_query;
  DocumentType.findOne({
    // To maintain log
    logging: (sql) => (log_query = sql),
    where: { id: req.params.id, isDeleted: false },
    raw: true,
  })
    .then((doc) => {
      createLog(req, constantLogType.DOCUMENT_TYPES, req.params.id, log_query);
      res.json({ success: true, data: doc });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.put("/document-type", validator(documentTypeValidationEdit), auth.required, async (req, res, next) => {
  // To maintain log
  let log_query;

  req.body.parentId = req.body.parentId == "" ? null : req.body.parentId;

  // get previous data
  const previousValue = await findPreviousData(constantLogType.DOCUMENT_TYPES, req.body.id, req.method);

  // check if the documetnt has childerns
  if (req.body.parentId != previousValue.dataValues.parentId) {
    const docTypeHasChildren = await DocumentType.findAll({
      where: {
        isDeleted: false,
        parentId: req.body.id,
      },
      raw: true,
    });

    if (docTypeHasChildren.length > 0) return res.send({ success: false, message: "Contains children document Type." });
  }

  // // check doc type exists
  // const checkDocTypeExists = await DocumentType.findOne({
  //   where: {
  //     isDeleted: false,
  //     name: req.body.name,
  //     parentId: req.body.parentId,
  //     hierarchy: req.body.hierarchy,
  //   },
  // });

  // if (checkDocTypeExists) {
  //   return res.json({
  //     success: false,
  //     message: "Document type with this name exists!!",
  //   });
  // }

  DocumentType.update(req.body, {
    // To maintain log
    logging: (sql) => (log_query = sql),
    raw: true,
    where: { id: req.body.id },
  })
    .then((_) => {
      createLog(req, constantLogType.DOCUMENT_TYPES, req.body.id, log_query, previousValue);
      res.json({ success: true, message: "Successful!" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.delete("/document-type/:id", auth.required, (req, res, next) => {
  deleteItem(
    DocumentType,
    {
      id: req.params.id,
      type: DOCUMENT_TYPE,
      from: "Document Type",
      hasHierarchy: true,
    },
    req.payload,
    (response) => {
      res.send(response);
    },
    req
  );
});

module.exports = router;
