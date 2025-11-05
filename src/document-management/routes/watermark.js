const router = require("express").Router();
const { Watermark } = require("../../config/database");
const { emptyTemp } = require("../../config/filesystem");
const multer = require("multer");

const validator = require("../../util/validation");
const { watermarkStorage } = require("../../config/filesystem");
const { watermarkValidation } = require("../../validations/watermark");

router.get("/watermark", (req, res, next) => {
  Watermark.findOne({ order: [["createdAt", "DESC"]] }).then((watermark) => {
    if (watermark) {
      res.send({ success: true, data: watermark });
    } else {
      Watermark.create().then((val) => {
        res.send({ success: true, data: val });
      });
    }
  });
});

router.put("/watermark", (req, res, next) => {
  Watermark.update(req.body, { where: { id: req.body.id }, raw: true })
    .then((watermark) => {
      emptyTemp();
      res.send({ success: true, message: "Successful" });
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, message: "Unsuccessful" });
    });
});

// router.post("/watermark",validator(watermarkValidation), (req, res, next) => {
router.post("/watermark", (req, res, next) => {
  // console.log(req.body, "values");
  const upload = multer({ storage: watermarkStorage }).single("file");
  upload(req, res, function (err) {
    console.log(req.body, "this is requestbody");
    // console.log(req.file.path, ":bodyand files");
    if (err instanceof multer.MulterError) {
      console.log("multer", err);
      return res.status(500).json(err);
    } else if (err) {
      console.log("multer error", err);

      return res.status(500).json(err);
    }
    const watermarkInfo = { ...req.body, image: req.file.path };
    console.log(watermarkInfo);
    try {
      Watermark.create(watermarkInfo)
        .then((watermark) => {
          res.send({ success: true, message: "Successful" });
        })
        .catch((err) => {
          console.log(err);
          res.send({ success: false, message: "Unsuccessful" });
        });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  });
});

module.exports = router;
