const router = require("express").Router();
const multer = require("multer");
const { CustomWatermark, Attachment, User } = require("../../config/database");
const { getBankObject, dms_features, includeThisFeature } = require("../../config/selectVendor");
const getUserEmail = require("../util/getEmailFromId");

// creating a diskStorage object to store the customWatermark images on customwatermark folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "customWatermark");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// initializing the multer object with the diskStorage object
const upload = multer({ storage: storage });

router.post("/custom-watermark", upload.single("watermarkImage"), async (req, res, next) => {
  // only png file type is accepted
  if (req.file && req.file.mimetype !== "image/png") {
    res.status(404).json({ success: "false", message: "Only PNG file type is accepted on custom watermark" });
  } else {
    let file = req.file ? req.file : "";
    const filePath = file.path ? file.path : getBankObject().logo;
    const watermarkText = req.body.watermarkText;
    const watermarkPosition = req.body.watermarkPosition;

    const getEmailFromId = await getUserEmail(req.body.userId);

    let watermark = {};
    watermark.watermarkText =
      watermarkText + " " + new Date().toLocaleString() || getEmailFromId + new Date().toLocaleString();
    watermark.watermarkPosition = watermarkPosition || 1;
    watermark.watermarkImagePath = filePath;
    watermark.createdBy = req.body.userId;
    watermark.isPreferred = req.body.saveSettings;
    watermark.useDefaultSettings = req.body.isActive;
    // save the custom watermark details in the database

    CustomWatermark.create(watermark)
      .then((data) => {
        User.update(
          {
            hasCustomWatermark: watermark.isPreferred,
            customWatermarkId: data.id,
          },
          {
            where: {
              id: req.body.userId,
            },
          }
        );
        res.send({ message: "Watermark added successfully", data: data.id });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

module.exports = router;