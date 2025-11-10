const router = require("express").Router();
const auth = require("../../config/auth");
const { deleteItem, DEPARTMENT } = require("../../config/delete");
const { Department, SecurityHierarchy } = require("../../config/database");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { respond } = require("../../util/response");
const { onlyForThisVendor, banks } = require("../../config/selectVendor");
const { consoleLog } = require("../../util");

/**
 * List all the **DEPARTMENTS** that are available
 */
router.get("/department", auth.required, async (req, res, next) => {
  const hierarchyDepartment = await availableHierarchy(req.payload, "departments", "*", "");
  if (hierarchyDepartment) {
    res.json(hierarchyDepartment);
  } else {
    console.log(err);
    res.send({ success: false, message: "No Department found." });
  }
  // Department.findAll({
  //   where: { isDeleted: false },
  // })
  //   .then((departments) => {
  //     res.json(departments);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.json({ success: false, message: "Error! Departments" });
  //   });
});

router.post("/department", auth.required, (req, res, next) => {
  req.body.hierarchy = "Central-001";

  const hierarchies = ["Central-001", "Super-001"];
  if (!hierarchies.includes(req.payload.hierarchy) && onlyForThisVendor(banks.rbb.name)) {
    // ErrorHandler(err, req, res);
    respond(res, "412", "You must be in central hierarchy to add Department.");
    return;
  }
  const department = req.body;
  Department.create(department)
    .then((_) => {
      res.json({ success: true, message: "Department successfully created!" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.put("/department", auth.required, (req, res, next) => {
  const department = req.body;
  Department.update(department, { where: { id: department.id } })
    .then((count) => {
      if (req.body.name)
        SecurityHierarchy.update({ name: req.body.name }, { where: { code: "Branch_" + req.body.id } }).catch((err) => {
          consoleLog("Error, ", err);
        });
      res.json({ success: true, message: "Department successfully updated!" });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error!" });
    });
});

router.get("/department/:id", auth.required, (req, res, next) => {
  Department.findOne({
    where: { id: req.params.id, isDeleted: false },
    raw: true,
  })
    .then((department) => {
      res.json({ success: true, data: department });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error! Department Single" });
    });
});

router.post("/get-all-department", auth.required, (req, res, next) => {
  Department.findAll({
    where: { isDeleted: false },
  })
    .then((departments) => {
      res.json({ success: true, data: departments });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error! Departments" });
    });
});

router.delete("/department/:id", auth.required, async (req, res, next) => {
  deleteItem(
    Department,
    {
      id: req.params.id,
      type: DEPARTMENT,
      from: "Department",
      hasHierarchy: true,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

module.exports = router;
