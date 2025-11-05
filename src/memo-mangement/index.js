/**
 * @module Memo
 */
const router = require("express").Router();

router.use(require("./routes/form_builder"));
router.use(require("./routes/memo"));

module.exports = router;
