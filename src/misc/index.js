/**
 * @module Miscellaneous
 */
const router = require("express").Router();

router.use(require("./routes/authorize"));
router.use(require("./routes/get_all"));
router.use(require("./routes/license"));
router.use(require("./routes/otp"));
router.use(require("./routes/dashboard"));

module.exports = router;
