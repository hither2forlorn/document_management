const router = require("express").Router();

router.use(require("./routes/location_map"));
router.use(require("./routes/favourite"));
router.use(require("./routes/location_type"));
router.use(require("./routes/document_type"));
router.use(require("./routes/document_index"));
router.use(require("./routes/document_index_values"));
router.use(require("./routes/document_condition"));
router.use(require("./routes/language"));
router.use(require("./routes/attachment"));
router.use(require("./routes/email"));
router.use(require("./routes/document"));
router.use(require("./routes/tag_cloud"));
router.use(require("./routes/watermark"));
router.use(require("./routes/tag"));
router.use(require("./routes/report"));
router.use(require("./routes/hourlyAccessMutiple"));
router.use(require("./routes/scanner"));
router.use(require("./routes/redaction"));
router.use(require("./routes/custom_watermark"));

module.exports = router;
