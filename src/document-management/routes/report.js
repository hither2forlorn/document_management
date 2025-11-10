const { documentReportAll } = require("../util/report_query");
const { SequelizeInstance, sequelize } = require("../../config/database");
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { execSelectQuery, execStoredProc, execStoredProcNew, execQueryWithParams } = require("../../util/queryFunction");
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


router.post("/DMS-branch-report", async (req, res) => {
  const { fromDate, toDate, branchName } = req.body;
 
  // ✅ Step 0: Validate input
  if (!fromDate || !toDate || !branchName) {
    return res.status(400).json({
      message: " From Date, To Date', and  BranchName are required fields.",
    });
  }
 
  try {
 
    const fullBranchName = `${branchName} BRANCH`;
 
    const [branchResult] = await sequelize.query(
      `
      SELECT RIGHT('0000' + CAST(branchCode AS VARCHAR), 4) AS branchId
      FROM branches
      WHERE LOWER(name) = LOWER(:branchName) AND isDeleted = 0
      `,
      {
        replacements: { branchName: fullBranchName },
        type: sequelize.QueryTypes.SELECT,
      }
    );
 
    if (!branchResult || !branchResult.branchId) {
      return res.status(400).json({ message: "❌ Branch not found or is marked deleted." });
    }
 
 
    const jsonRequest = {
      functionName: "BranchAOFDetails",
      requestData: {
        fromDate,
        toDate,
        branchId: branchResult.branchId,
      },
    };
 
 
    const response = await fetch("http://10.1.3.49:9999/branch-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonRequest),
    });
 
    const rawResponseText = await response.text();
 
 
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawResponseText);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError.message);
      return res.status(500).json({
        message: "Failed to parse JSON response from external service",
        rawResponse: rawResponseText,
      });
    }
 
    if (!jsonResponse?.QueryResult?.length) {
      return res.status(200).json({ message: "✅ No data found from external API.", data: [] });
    }
 
    // delete old data BranchAccountDetails
    await sequelize.query(`DELETE FROM BranchAccountDetails`);
 
    // Insert each record into BranchAccountDetails
    for (const record of jsonResponse.QueryResult) {
      await sequelize.query(
        `
        INSERT INTO BranchAccountDetails
          (BRANCHID, BRANCHNAME, ACCT_NAME, ACCOUNT_NO, ACCT_OPN_DATE, SCHM_CODE, SCHM_DESC)
        VALUES
          (:BRANCHID, :BRANCHNAME, :ACCT_NAME, :ACCOUNT_NO, :ACCT_OPN_DATE, :SCHM_CODE, :SCHM_DESC)
        `,
        {
          replacements: {
            BRANCHID: record.BRANCHID,
            BRANCHNAME: record.BRANCHNAME,
            ACCT_NAME: record.ACCT_NAME,
            ACCOUNT_NO: record.ACCOUNT_NO,
            ACCT_OPN_DATE: record.ACCT_OPN_DATE || null,
            SCHM_CODE: record.SCHM_CODE,
            SCHM_DESC: record.SCHM_DESC,
          },
        }
      );
    }
 
    // With this block:
    const finalResult = await sequelize.query(
      `
  SELECT
    ROW_NUMBER() OVER (ORDER BY b.ACCT_OPN_DATE) AS [S.N],
    b.BRANCHID,
    b.BRANCHNAME,
    b.ACCT_NAME,
    b.ACCOUNT_NO,
    b.ACCT_OPN_DATE,
    b.SCHM_CODE,
    b.SCHM_DESC,
    CASE
      WHEN d1.name IS NOT NULL THEN 'yes'
      WHEN d2.name IS NOT NULL THEN 'no (not approved)'
      ELSE 'no'
    END AS isExistsOnDMS
  FROM BranchAccountDetails b
  LEFT JOIN documents d1 ON d1.name = b.ACCOUNT_NO AND d1.isDeleted = 0 AND d1.isApproved = 1
  LEFT JOIN documents d2 ON d2.name = b.ACCOUNT_NO AND d2.isDeleted = 0 AND d2.isApproved = 0
  WHERE b.BRANCHID = :branchId
    AND b.ACCT_OPN_DATE BETWEEN CONVERT(DATE, :fromDate, 105) AND CONVERT(DATE, :toDate, 105)
  `,
      {
        replacements: { branchId: branchResult.branchId, fromDate, toDate },
        type: sequelize.QueryTypes.SELECT,
      }
    );
 
 
    return res.status(200).json(finalResult);
  } catch (error) {
    console.error("❌ Final Error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
});
 

router.post("/DMS-all-branch-report", auth.required, async (req, res, next) => {
  const { fromDate, toDate } = req.body;

  if (!fromDate || !toDate) {
    return res.status(400).json({ message: "Please provide a date range" });
  }

  try {
    const data = await execStoredProcNew("AllBranchDMSReport", { fromDate, toDate });

    if (data.length === 0) {
      return res.status(200).json({ message: "No data found" });
    }


    return res.status(200).json(data);
  } catch (error) {
    console.error(error, "==========Error=====================");
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
