const router = require("express").Router();
const auth = require("../../config/auth");
const { BRANCH, deleteItem } = require("../../config/delete");
const { Branch, BranchLogo, sequelize, SecurityHierarchy } = require("../../config/database");
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { execSelectQuery } = require("../../util/queryFunction");
const { consoleLog } = require("../../util");
const { respond } = require("../../util/response");

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

router.get("/branchesFilter", async (req, res) => {
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

  // checkif branch code and branch name is already taken
  Branch.findOne({
    where: {
      [Op.or]: [{ branchCode: branch.branchCode }, { name: branch.name }],
      isDeleted: false,
    },
  })
    .then((branchFound) => {
      if (branchFound) {
        return res.json({ success: false, message: "Branch Code or Branch Name already taken." });
      } else {
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
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Server Error!" });
    });
});

router.put("/branches", auth.required, (req, res, next) => {
  const branch = req.body;

  // checkif branch code and branch name is already taken
  Branch.findOne({
    where: {
      [Op.or]: [{ branchCode: branch.branchCode }, { name: branch.name }],
      isDeleted: false,
      id: {
        [Op.ne]: branch.id,
      },
    },
  }).then((branchFound) => {
    if (branchFound) {
      return respond(res, "409", "Branch Code or Branch Name already taken.");
    }
  });

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
    },
    req
  );
});

module.exports = router;
