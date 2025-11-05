const router = require("express").Router();
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { hourlyAccess } = require("../security-level");

router.post("/send-email/:type", auth.required, async (req, res, next) => {
  const { type } = req.params;
  try {
    switch (type) {
      case "HOURLY_ACCESS":
        await hourlyAccess(req.body, true).then((response) => res.send(response));
        break;
      default:
        res.send({ success: false, message: "Request not valid!" });
        break;
    }
  } catch (err) {
    logger.error(err);
    res.status(500).send("Error!");
  }
});

module.exports = router;
