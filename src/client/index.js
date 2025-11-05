const router = require("express").Router();

router.use("/client", require("./routes/memo"));
router.use("/client", require("./routes/auth"));
router.use("/client", require("./routes/user"));
router.use("/client", require("./routes/attachment"));
router.use("/client", require("./routes/otp"));

module.exports = router;
