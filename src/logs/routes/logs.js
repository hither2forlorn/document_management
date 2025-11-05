const auth = require("../../config/auth");
const { Logs, Reporting } = require("../../config/database");
const { execSelectQuery } = require("../../util/queryFunction");
const router = require("express").Router();

router.get("/logs/pagination", async (req, res, next) => {
  let { page, limit, searchingParameters, queryId } = req.query;
  const pageSize = Number(limit);
  const offset = (Number(page) - 1) * Number(limit);

  const reportQuery = await Reporting.findOne({ where: { id: queryId } });
  let query = reportQuery.query;

  const hashParams = query.includes("#");
  console.log(hashParams, query);
  let diffQuery = "",
    result = {};

  if (hashParams) {
    query = "SELECT * from logs l --where l.operation = #Operation__STRING or l.id = #Id__NUMBER or l.id = #idd__number";

    const split = query.split(" ");

    split.forEach((row) => {
      const newSplit = row.split("#");
      if (newSplit.length > 1) {
        const string = newSplit[1].split("__");
        result = { ...result, [newSplit[1]]: string[1] };
      }
    });
  }

  const allLogs = await execSelectQuery(diffQuery || query);

  res.send({
    data: allLogs,
    inputField: hashParams ? result : [],
    success: true,
  });
});

router.get("/logs/reporting", async (req, res, next) => {
  const data = await Reporting.findAll();
  return res.send({ data: data });
});

router.get("/logs/reporting_iframe", async (req, res, next) => {
  const data = await Reporting_Iframe.findAll();
  return res.send({ data: data });
});

module.exports = router;

// for pagination
//   `
// SELECT * from logs l
// ` +
//   `ORDER BY l.id DESC
// OFFSET ${offset} ROWS FETCH NEXT ${pageSize}  ROWS ONLY`;
