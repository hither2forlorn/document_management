const router = require("express").Router();
const { DocumentIndexValue } = require("../../config/database");

router.post("/document-index-value", async (req, res, next) => {
  const result = req.body;
  docIds = result.pop();
  try {
    let arr = await Promise.all(
      result.map((element) => {
        return DocumentIndexValue.create({
          documentId: docIds,
          documentIndexId: element.id,
          value: element.name,
        }).then((name) => {
          return name;
        });
      })
    );
    res.json({ success: true, data: arr });
  } catch (err) {
    console.log(err);
  }
});
router.get("/document-index-value", (req, res, next) => {
  DocumentIndexValue.findAll()
    .then((name) => {
      res.json({ success: true, data: name });
    })
    .catch((err) => {
      res.json({ success: false, message: "Error" });
    });
});

router.get("/document-index-value/:id", (req, res, next) => {
  DocumentIndexValue.findAll({ where: { id: req.params.id } })
    .then((name) => {
      res.json({ success: true, data: name });
    })
    .catch((err) => {
      res.json({ success: false, message: "Error" });
    });
});

router.get("/document-index-value/attachmentId/:id", (req, res, next) => {
  console.log("should now search for documentIndex from attachmentid where attachmentId: ", req.params.id);
  DocumentIndexValue.findAll({ where: { attachmentId: req.params.id } })
    .then((name) => {
      res.json({ success: true, data: name });
    })
    .catch((err) => {
      res.json({ success: false, message: "Error" });
    });
});

router.put("/document-index-value", (req, res, next) => {
  DocumentIndexValue.update(req.body, { where: { id: req.body.id } })
    .then((_) => {
      res.json({ success: true, message: "Success" });
    })
    .catch((err) => {
      res.json({ success: false, message: "Error" });
    });
});

router.delete("/document-index-value", (req, res, next) => {
  deleteItem(
    DocumentIndexValue,
    {
      id: req.params.id,
      type: DOCUMENT_INDEX,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});
module.exports = router;
