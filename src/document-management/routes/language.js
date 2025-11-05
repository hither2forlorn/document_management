const router = require("express").Router();
const auth = require("../../config/auth");
const validator = require("../../util/validation");
const { deleteItem, LANGUAGE } = require("../../config/delete");
const { Language } = require("../../config/database");
const { languageValidation, languageValidationEdit } = require("../../validations/language");

router.post("/language", validator(languageValidation), auth.required, (req, res, next) => {
  // check if language already exist
  Language.findOne({ where: { name: req.body.name } }).then((language) => {
    if (language) {
      return res.status(400).json({ message: "Language already exists" });
    } else {
      Language.create(req.body)
        .then((_) => {
          res.json({ success: true, message: "Successful!" });
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: false, message: "Error!" });
        });
    }
  });
});

router.get("/language", auth.required, (req, res, next) => {
  Language.findAll({
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

router.get("/language/:id", auth.required, (req, res, next) => {
  Language.findOne({
    where: { id: req.params.id, isDeleted: false },
    raw: true,
  })
    .then((doc) => {
      res.json({ success: true, data: doc });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.put("/language", validator(languageValidationEdit), auth.required, (req, res, next) => {
  Language.update(req.body, {
    where: { id: req.body.id },
  })
    .then((_) => {
      res.json({ success: true, message: "Successful!" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.delete("/language/:id", auth.required, (req, res, next) => {
  deleteItem(
    Language,
    {
      id: req.params.id,
      type: LANGUAGE,
    },
    req.payload,
    (response) => {
      res.send(response);
    },
    req
  );
});

module.exports = router;
