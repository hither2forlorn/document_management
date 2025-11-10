const router = require("express").Router();
const auth = require("../../config/auth");
const validator = require("../../util/validation");
const { deleteItem, DOCUMENT_CONDITION } = require("../../config/delete");
const { DocumentCondition } = require("../../config/database");
const { documentConditionValidation, documentConditionValidationEdit } = require("../../validations/document_condition");

router.post("/document-condition", validator(documentConditionValidation), auth.required, (req, res, next) => {
  DocumentCondition.create(req.body)
    .then((_) => {
      res.json({ success: true, message: "Successfully created!" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.get("/document-condition", (req, res, next) => {
  DocumentCondition.findAll({
    where: { isDeleted: false },
  })
    .then((locationTypes) => {
      res.json({ success: true, data: locationTypes });
    })
    .catch((err) => {
      res.status(500);
      res.json({ success: false, data: "Error in the server!" });
    });
});

router.put("/document-condition", validator(documentConditionValidationEdit), auth.required, (req, res, next) => {
  DocumentCondition.update(req.body, { where: { id: req.body.id } })
    .then((_) => {
      res.json({ success: true, message: "Successfully updated!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Error! On the server" });
    });
});

router.get("/document-condition/:id", auth.required, (req, res, next) => {
  DocumentCondition.findOne({
    where: { id: req.params.id, isDeleted: false },
    raw: true,
  })
    .then((documentCondition) => {
      res.json({ success: true, data: documentCondition });
    })
    .catch((err) => {
      res.json({ success: false, data: "Error in the server!" });
    });
});

router.delete("/document-condition/:id", auth.required, (req, res, next) => {
  deleteItem(
    DocumentCondition,
    {
      id: req.params.id,
      type: DOCUMENT_CONDITION,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

module.exports = router;
