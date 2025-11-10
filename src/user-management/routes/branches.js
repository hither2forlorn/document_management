const router = require("express").Router();
const auth = require("../../config/auth");
const { BRANCH, deleteItem } = require("../../config/delete");
const { Branch, BranchLogo, sequelize, SecurityHierarchy } = require("../../config/database");
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { execSelectQuery } = require("../../util/queryFunction");
const { consoleLog } = require("../../util");

/**
 * List all the **BRANCHES** that are available
 */

router.get("/branches", auth.required, async (req, res, next) => {
  const hierarchyBranches = await availableHierarchy(req.payload, "branches", "*", "");
  if (hierarchyBranches) {
    res.json({ success: true, data: hierarchyBranches });
  } else {
    console.log(err);
    res.send({ success: false, message: "No Branches found." });
  }
  // Branch.findAll({
  //   where: { isDeleted: false },
  // })
  //   .then((branches) => {
  //     res.json({ success: true, data: branches });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //     res.status(500);
  //     res.json({ success: false, message: "Server Error!" });
  //   });
});

const firstNameRegex = /^[^\s]+/; // Regex to match the first word of the name

router.get("/branches-locationMap", auth.required, async (req, res) => {
  try {
    const query = `
      WITH RankedMatches AS (
  SELECT
    b.id AS branch_id,
    b.name AS branch_name,
    b.city,
    b.country,
    b.province,
    b.branchCode,
    b.phoneNumber,
    b.street,
    l.id AS location_id,
    l.name AS location_name,
    l.level,
    l.parentId,
    l.locationTypeId,
    ROW_NUMBER() OVER (
      PARTITION BY b.id
      ORDER BY LEN(l.name) DESC
    ) AS row_num
    FROM branches b
    JOIN location_maps l 
    ON CHARINDEX(l.name, b.name) > 0
    WHERE b.isDeleted = 0 AND l.isDeleted = 0)
    SELECT *
    FROM RankedMatches WHERE row_num = 1 ORDER BY branch_id;
    `;

    const result = await execSelectQuery(query);

    if (!result || result.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No matching branches and locations found.",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching branches with location maps:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/branchesFilter", auth.required, async (req, res) => {
  const query = `select id, name  from branches where id not in (
	select b.id from branches b
	join security_hierarchies sh on 'Branch_' + CAST(b.id as varchar(30)) = sh.code
	where  sh.isDeleted = 0 and b.isDeleted = 0
	) and isDeleted=0`;

  const filterBranch = await execSelectQuery(query);

  res.json(filterBranch);
});

router.post("/branches", auth.required, (req, res, next) => {
  const branch = req.body;
  Branch.create(branch)
    .then((b) => {
      BranchLogo.create({
        branchId: b.id,
        branchLogo: branch.branchLogo,
      });
      res.json({ success: true, message: "Successful!" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Server Error!" });
    });
});

router.put("/branches", auth.required, (req, res, next) => {
  const branch = req.body;
  Branch.update(branch, {
    where: { id: req.body.id, isDeleted: false },
  })
    .then((_) => {
      if (req.body.name)
        SecurityHierarchy.update({ name: req.body.name }, { where: { code: "Branch_" + req.body.id } }).catch((err) => {
          consoleLog("Error, ", err);
        });

      if (branch.branchLogo) {
        const branchLogo = {
          branchLogo: branch.branchLogo,
          branchId: branch.id,
        };
        BranchLogo.update(branchLogo, { where: { branchId: branch.id } }).then((count) => {
          if (count[0] === 0) {
            BranchLogo.create(branchLogo)
              .then((_) => {
                res.json({
                  success: true,
                  message: "Branch successfully updated!",
                });
              })
              .catch((err) => {
                console.log(err);
                res.json({ success: true, message: "Logo too Large!" });
              });
          } else {
            res.json({
              success: true,
              message: "Branch successfully updated!",
            });
          }
        });
      } else {
        res.json({ success: true, message: "Branch successfully updated!" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Server Error!" });
    });
});

router.get("/branches/:id", auth.required, (req, res, next) => {
  Branch.findOne({
    where: { id: req.params.id, isDeleted: false },
    raw: true,
  })
    .then((branches) => {
      res.json({ success: true, data: branches });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Server Error!" });
    });
});

router.get("/branches/logo/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  BranchLogo.findOne({
    where: { branchId: id },
    raw: true,
  }).then((branch) => {
    res.json({
      success: true,
      data: branch,
    });
  });
});

router.delete("/branches/:id", auth.required, (req, res, next) => {
  deleteItem(
    Branch,
    {
      id: req.params.id,
      type: BRANCH,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

module.exports = router;
