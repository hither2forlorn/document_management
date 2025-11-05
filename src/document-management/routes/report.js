const { documentReportAll } = require("../util/report_query");
const { SequelizeInstance } = require("../../config/database");
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const router = require("express").Router();
router.get("/document/report/:type", auth.required, (req, res, next) => {
  const type = req.params.type;
  const userId = req.payload.id;
  let query = "";
  switch (type) {
    case "all":
      query = documentReportAll(userId);
      break;
    default:
      res.status(404).send();
      return;
  }
  SequelizeInstance.query(query)
    .then(([results]) => {
      res.send(results);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
});

module.exports = router;
