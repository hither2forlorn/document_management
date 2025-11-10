const router = require("express").Router();
const auth = require("../../config/auth");
const { SecurityHierarchy } = require("../../config/database");
const { deleteItem, DEPARTMENT } = require("../../config/delete");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { execSelectQuery } = require("../../util/queryFunction");

/**
 * List all the **HIERARCHIES** that are available
 */
router.get("/security-hierarchy", auth.required, async (req, res, next) => {
  // const hierarchy = await SecurityHierarchy.findAll({
  //   where: { isDeleted: false },
  // });
  const hierarchy = await availableHierarchy(req.payload.id, "security_hierarchies", "*", "", "code");
  res.json(hierarchy);
});

router.get("/security-hierarchy/:id", auth.required, (req, res, next) => {
  // To maintain log
  let log_query;
  SecurityHierarchy.findOne({
    where: {
      id: req.params.id,
      isDeleted: false,
    },
  })
    .then((hierarchy) => {
      // To maintain log
      createLog(req, constantLogType.SECURITY_HIERARCHY, req.params.id, log_query);
      if (hierarchy.code.match("Branch_")) hierarchy.dataValues["isManuallyAdded"] = false;
      else hierarchy.dataValues["isManuallyAdded"] = true;
      res.json({ success: true, data: hierarchy });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error! hierarchy Single" });
    });
});

router.post("/security-hierarchy", auth.required, async (req, res) => {
  // To maintain log
  let log_query;

  req.body.departmentId = req.body?.department || "";

  if (req.body.branchData) {
    req.body.branchData.map((data) => {
      SecurityHierarchy.create(
        {
          name: data.label,
          code: "Branch_" + data.value,
          branchId: data.value,
          type: "branch",
          level: req.body.level,
          parentId: req.body.parentId,
        },
        {
          // To maintain log
          logging: (sql) => (log_query = sql),
          raw: true,
        }
      )
        .then((_) => {
          // To maintain log
          createLog(req, constantLogType.SECURITY_HIERARCHY, data.value, log_query);
          res.json({
            success: true,
            message: "Hierarchy successfully created!",
          });
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: false, message: "Error!" });
        });
    });
  } else {
    const centralOfficeResult = await execSelectQuery("SELECT id FROM security_hierarchies WHERE name LIKE 'Central Office'");

    if (centralOfficeResult.length === 0) {
      throw new Error('Central Office not found');
    }

    const centralOfficeId = centralOfficeResult[0].id;

    const resQuery = await execSelectQuery(`SELECT COUNT(*) AS hierarchyUnderCentralOffice FROM security_hierarchies WHERE parentId = ${centralOfficeId}`);

    const totalCentralOfficeChild = resQuery[0].hierarchyUnderCentralOffice;


    SecurityHierarchy.findOne({
      where: { code: req.body.code, isDeleted: false },
    })
      .then((hierarchy) => {
        if (hierarchy) res.send({ success: false, message: "Hierarchy Already Exists" });
        if (Number.parseInt(req.body.parentId) === centralOfficeId && totalCentralOfficeChild >= 10) res.send({ success: false, message: "You have reached your limit of 10 departments. Please contact the service provider to increase your limit." });
        else
          SecurityHierarchy.create(req.body)
            .then((_) => {
              res.json({
                success: true,
                message: "Hierarchy successfully created!",
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({ success: false, message: "Error!" });
            });
      })
      .catch((err) => {
        console.log(err);
        res.json({ success: false, message: "Error! hierarchy Single" });
      });
  }
});

router.put("/security-hierarchy", auth.required, async (req, res, next) => {
  // To maintain log
  let log_query;
  const hierarchy = req.body;

  const previousValue = await findPreviousData(constantLogType.SECURITY_HIERARCHY, hierarchy.id, req.method);
  await SecurityHierarchy.update(hierarchy, {
    where: { id: hierarchy.id },
    logging: (sql) => (log_query = sql),
  })
    .then((count) => {
      // To maintain log
      createLog(req, constantLogType.SECURITY_HIERARCHY, hierarchy.id, log_query, previousValue);
      res.json({ success: true, message: "Hierarchy successfully updated!" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.delete("/security-hierarchy/:id", auth.required, async (req, res, next) => {
  // await SecurityHierarchy.destroy({
  //   where: { id: req.params.id },
  // });
  // res.send({ success: true });
  deleteItem(
    SecurityHierarchy,
    {
      id: req.params.id,
      type: DEPARTMENT,
      from: "Security Hierarchy",
      hasHierarchy: true,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

module.exports = router;
