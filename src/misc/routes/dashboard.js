const router = require("express").Router();
const { SequelizeInstance } = require("../../config/database");
const { deleteLogReport, documentTypeReport } = require("../util/report_query");

const logger = require("../../config/logger");
const auth = require("../../config/auth");

router.get("/report/:type", auth.required, (req, res, next) => {
  const type = req.params.type;
  const userId = req.payload.id;
  let query = "";
  try {
    switch (type) {
      case "delete-log":
        query = deleteLogReport(userId);
        break;
      case "document-type":
        query = documentTypeReport(userId);
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
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
