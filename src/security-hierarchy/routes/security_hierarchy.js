const router = require("express").Router();
const auth = require("../../config/auth");
const { SecurityHierarchy, MultipleHierarchies, DepartmentHierarchy } = require("../../config/database");
const { deleteItem, DEPARTMENT } = require("../../config/delete");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const { Op } = require("sequelize");

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

router.get("/security-hierarchy-branches", async (req, res, next) => {
  try {
    // Await the database call to ensure the data is fetched before responding
    const branches = await SecurityHierarchy.findAll({
      where: {
        parentId: {         // Filter by parentId >= 3
          [Op.gte]: 2       // 'gte' stands for 'greater than or equal to'
        },
        type: {
          [Op.ne]: "department" // Exclude type="department"
        }
      }
    });
    // Send a success response with the branches data
    res.json({
      success: true,
      message: "Branches Fetched Successfully",
      branches
    });
  } catch (error) {
    console.error(error);

    // Send an error response with status code 500 for server errors
    res.status(500).json({
      success: false,
      message: "Unable to Fetch Security Hierarchy Branches",
      error: error.message // Including error details for debugging (optional)
    });
  }
});


router.get("/security-hierarchy/:id", auth.required, (req, res, next) => {
  // To maintain log
  let log_query;
  SecurityHierarchy.hasMany(MultipleHierarchies, { foreignKey: "modelValueId" });
  MultipleHierarchies.belongsTo(SecurityHierarchy, { foreignKey: "modelValueId" });
  SecurityHierarchy.findOne({
    include: {
      model: MultipleHierarchies,
    },
    where: {
      id: req.params.id,
      // isDeleted: false,
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

// router.post("/security-hierarchy", auth.required, (req, res) => {
//   // To maintain log
//   let log_query;

//   req.body.departmentId = req.body?.department || "";
//   if (req.body.branchData) {
//     req.body.branchData.map((data) => {
//       SecurityHierarchy.create(
//         {
//           name: data.label,
//           code: "Branch_" + data.value,
//           branchId: data.value,
//           type: "branch",
//           level: req.body.level,
//           parentId: req.body.parentId,
//         },
//         {
//           // To maintain log
//           logging: (sql) => (log_query = sql),
//           raw: true,
//         }
//       )
//         .then((_) => {
//           // To maintain log
//           createLog(req, constantLogType.SECURITY_HIERARCHY, data.value, log_query);
//           res.json({
//             success: true,
//             message: "Hierarchy successfully created!",
//           });
//         })
//         .catch((err) => {
//           console.log(err);
//           res.json({ success: false, message: "Error!" });
//         });
//     });
//   } else {
//     SecurityHierarchy.findOne({
//       where: { code: req.body.code, isDeleted: false },
//     })
//       .then((hierarchy) => {
//         if (hierarchy) res.send({ success: false, message: "Hierarchy Already Exists" });
//         else
//           SecurityHierarchy.create(req.body)
//             .then((_) => {
//               res.json({
//                 success: true,
//                 message: "Hierarchy successfully created!",
//               });
//             })
//             .catch((err) => {
//               console.log(err);
//               res.json({ success: false, message: "Error!" });
//             });
//       })
//       .catch((err) => {
//         console.log(err);
//         res.json({ success: false, message: "Error! hierarchy Single" });
//       });
//   }
// });

// router.put("/security-hierarchy", auth.required, async (req, res, next) => {
//   // To maintain log
//   let log_query;
//   let hierarchy = req.body.hierarchy;
//   const multipleHierarchies = Array.isArray(req?.body?.multipleHierarchy) ? req?.body?.multipleHierarchy : [];

//   console.log(multipleHierarchies, "multipleHierarchies");
//   const previousValue = await findPreviousData(constantLogType.SECURITY_HIERARCHY, hierarchy.id, req.method);

//   if (multipleHierarchies.length > 0) hierarchy.multipleHierarchy = true;
//   else {
//     hierarchy.multipleHierarchy = false;
//     if (hierarchy.id)
//       await MultipleHierarchies.destroy({
//         where: { modelValueId: hierarchy.id, modelTypesId: 5 },
//       });
//   }

//   await SecurityHierarchy.update(hierarchy, {
//     where: { id: hierarchy.id },
//     logging: (sql) => (log_query = sql),
//   });

//   await Promise.all(
//     multipleHierarchies?.map(async (data, id) => {
//       if (data && data.modelValueId) {
//         await MultipleHierarchies.destroy({
//           where: { modelValueId: data.modelValueId, modelTypesId: 5 },
//         });
//       }

//       return await MultipleHierarchies.create({
//         // hierarchy_id: data?.hierarchy_id,
//         hierarchy: data?.hierarchy,
//         modelValueId: data?.modelValueId,
//         modelTypesId: 5,
//       });
//     })
//   );

//   await createLog(req, constantLogType.SECURITY_HIERARCHY, hierarchy.id, log_query, previousValue);
//   res.json({ success: true, message: "Hierarchy successfully updated!" });
// });

// router.delete("/security-hierarchy/:id", auth.required, async (req, res, next) => {
//   deleteItem(
//     SecurityHierarchy,
//     {
//       id: req.params.id,
//       type: DEPARTMENT,
//       from: "Security Hierarchy",
//       hasHierarchy: true,
//     },
//     req.payload,
//     async (response) => {
//       await MultipleHierarchies.update(
//         {
//           isDeleted: true,
//         },
//         {
//           where: { modelValueId: req.params.id, modelTypesId: 5 },
//         }
//       );
//       res.send(response);
//     },
//     req
//   );
// });


router.delete("/security-hierarchy/:id", auth.required, async (req, res, next) => {
  try {
    // Perform the main deletion
    await deleteItem(
      SecurityHierarchy,
      {
        id: req.params.id,
        type: DEPARTMENT,
        from: "Security Hierarchy",
        hasHierarchy: true,
      },
      req.payload,
      async (response) => {
        try {
          // Update MultipleHierarchies
          await MultipleHierarchies.update(
            { isDeleted: true },
            {
              where: {
                modelValueId: req.params.id,
                modelTypesId: 5,
              },
            }
          );

          // Delete related entries in DepartmentHierarchies using hierarchyId
          await DepartmentHierarchy.destroy({
            where: { hierarchyId: req.params.id },
          });

          res.send(response);
        } catch (err) {
          console.error("Error during related deletions:", err);
          res.status(500).send({
            success: false,
            message: "Error deleting related records.",
          });
        }
      },
      req
    );
  } catch (err) {
    console.error("Error in deleting SecurityHierarchy:", err);
    res.status(500).send({
      success: false,
      message: "Error deleting SecurityHierarchy.",
    });
  }
});


router.post("/security-hierarchy", auth.required, (req, res) => {
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
        .then((hierarchy) => {
          // Insert into department_hierarchy junction table
          if (req.body.department) {
            DepartmentHierarchy.create({
              departmentId: req.body.department,
              hierarchyId: hierarchy.security_hierarchy.dataValues.id,
            })
              .then(() => {
                // To maintain log
                createLog(req, constantLogType.SECURITY_HIERARCHY, data.value, log_query);
                res.json({
                  success: true,
                  message: "Hierarchy successfully created!",
                });
              })
              .catch((err) => {
                console.error("Error adding to department_hierarchy:", err);
                res.json({ success: false, message: "Error!" });
              });
          } else {
            createLog(req, constantLogType.SECURITY_HIERARCHY, data.value, log_query);
            res.json({
              success: true,
              message: "Hierarchy successfully created!",
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: false, message: "Error!" });
        });
    });
  } else {
    SecurityHierarchy.findOne({
      where: { code: req.body.code, isDeleted: false },
    })
      .then((hierarchy) => {
        if (hierarchy) {
          res.send({ success: false, message: "Hierarchy Already Exists" });
        } else {
          SecurityHierarchy.create(req.body)
            .then((newHierarchy) => {
              const hierarchyId = newHierarchy.dataValues.id; // Directly
              // Insert into department_hierarchy junction table
              if (req.body.department) {
                DepartmentHierarchy.create({
                  departmentId: req?.body?.department,
                  hierarchyId: hierarchyId,
                })
                  .then(() => {
                    res.json({
                      success: true,
                      message: "Hierarchy successfully created!",
                    });
                  })
                  .catch((err) => {
                    console.error("Error adding to department_hierarchy:", err);
                    res.json({ success: false, message: "Error!" });
                  });
              } else {
                res.json({
                  success: true,
                  message: "Hierarchy successfully created!",
                });
              }
            })
            .catch((err) => {
              console.log(err);
              res.json({ success: false, message: "Error!" });
            });
        }
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
  let hierarchy = req.body.hierarchy;
  const multipleHierarchies = Array.isArray(req?.body?.multipleHierarchy) ? req?.body?.multipleHierarchy : [];
  const departmentId = req.body.department; // Extract departmentId from the request

  const previousValue = await findPreviousData(constantLogType.SECURITY_HIERARCHY, hierarchy.id, req.method);

  if (multipleHierarchies.length > 0) hierarchy.multipleHierarchy = true;
  else {
    hierarchy.multipleHierarchy = false;
    if (hierarchy.id)
      await MultipleHierarchies.destroy({
        where: { modelValueId: hierarchy.id, modelTypesId: 5 },
      });
  }

  // Update the SecurityHierarchy table
  await SecurityHierarchy.update(hierarchy, {
    where: { id: hierarchy.id },
    logging: (sql) => (log_query = sql),
  });

  // Update the department_hierarchy table
  if (departmentId && hierarchy.id) {
    await DepartmentHierarchy.destroy({
      where: { hierarchyId: hierarchy.id }, // Remove existing associations
    });

    await DepartmentHierarchy.create({
      departmentId: departmentId,
      hierarchyId: hierarchy.id,
    });
  }

  // Update the MultipleHierarchies table
  await Promise.all(
    multipleHierarchies?.map(async (data) => {
      if (data && data.modelValueId) {
        await MultipleHierarchies.destroy({
          where: { modelValueId: data.modelValueId, modelTypesId: 5 },
        });
      }

      return await MultipleHierarchies.create({
        hierarchy: data?.hierarchy,
        modelValueId: data?.modelValueId,
        modelTypesId: 5,
      });
    })
  );

  // Create a log for the update operation
  await createLog(req, constantLogType.SECURITY_HIERARCHY, hierarchy.id, log_query, previousValue);
  res.json({ success: true, message: "Hierarchy successfully updated!" });
});



module.exports = router;
