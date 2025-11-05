const router = require("express").Router();
const { DocumentTypeIndex } = require("../../config/database");
const { deleteItem, DOCUMENT_INDEX } = require("../../config/delete");
const auth = require("../../config/auth");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");

router.post("/document-index", auth.required, async (req, res, next) => {
  let log_query;
  // console.log(req.body, "asasa");

  // To maintain log
  const docTypeIndexRes = await DocumentTypeIndex.bulkCreate(req.body, {
    // To maintain log
    logging: (sql) => (log_query = sql),
    raw: true,
  });

  Promise.all(
    docTypeIndexRes.map(async (row) => {
      return await createLog(req, constantLogType.DOCUMENT_INDEX, row.id, log_query);
    })
  );
  res.json({ success: true, message: "Successful!" });
});

router.get("/document-index", auth.required, async (req, res, next) => {
  // const document_index = await availableHierarchy(
  //   req.payload.id,
  //   "document_indicies",
  //   "*",
  //   ""
  // );

  const document_index = await DocumentTypeIndex.findAll();
  res.json({ success: true, data: document_index });
});
router.get("/document-index/:id", auth.required, (req, res, next) => {
  // To maintain log
  let log_query;
  DocumentTypeIndex.findAll({
    // To maintain log
    logging: (sql) => (log_query = sql),
    raw: true,
    where: { id: req.params.id },
  })
    .then((name) => {
      // To maintain log
      createLog(req, constantLogType.DOCUMENT_INDEX, req.params.id, log_query);
      res.json({ success: true, data: name });
    })
    .catch((err) => {
      res.json({ success: false, message: "Error" });
    });
});

router.get("/document-index-doc/:id", auth.required, (req, res, next) => {
  DocumentTypeIndex.findAll({ where: { docId: req.params.id } })
    .then((name) => {
      res.json({ success: true, data: name });
    })
    .catch((err) => {
      res.json({ success: false, message: "Error" });
    });
});

router.put("/document-index/", auth.required, async (req, res, next) => {
  // To maintain log
  let log_query;
  // To maintain log
  const role = req.body;

  try {
    const requestedBody = req.body[0];
    const previousValue = await findPreviousData(constantLogType.DOCUMENT_INDEX, requestedBody.id, req.method);
    console.log("req body is: ", requestedBody);
    const updatedIndex = await DocumentTypeIndex.update(requestedBody, {
      // To maintain log
      logging: (sql) => (log_query = sql),
      raw: true,
      where: { id: requestedBody.id },
    });
    if (updatedIndex) {
      // To maintain log
      createLog(req, constantLogType.DOCUMENT_INDEX, requestedBody.id, log_query, previousValue);
      res.status(200).json({
        message: "Sucessfully Changed",
        success: true,
      });
    }
  } catch (err) {
    console.log("error from controller: ", err);
    res.json({ success: false, message: "Error" });
  }
});

router.delete("/document-index/:id", auth.required, async (req, res, next) => {
  // To maintain log
  let log_query;
  const previousValue = await findPreviousData(constantLogType.DOCUMENT_INDEX, req.params.id, req.method);
  try {
    await DocumentTypeIndex.destroy({
      // To maintain log
      logging: (sql) => (log_query = sql),
      raw: true,
      where: { id: req.params.id },
    });
    // To maintain log
    createLog(req, constantLogType.DOCUMENT_INDEX, req.params.id, log_query, previousValue);
    res.status(204).json({
      status: "successful",
    });
  } catch (e) {
    console.log("error from delete: ", e);
  }
});
module.exports = router;
