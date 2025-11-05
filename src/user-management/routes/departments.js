const router = require("express").Router();
const auth = require("../../config/auth");
const { deleteItem, DEPARTMENT } = require("../../config/delete");
const { Department, SecurityHierarchy, DepartmentHierarchy, sequelize } = require("../../config/database");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { respond } = require("../../util/response");
const { onlyForThisVendor, banks } = require("../../config/selectVendor");
const { execSelectQuery } = require("../../util/queryFunction");
/**
 * List all the **DEPARTMENTS** that are available
 */
// router.get("/department", auth.required, async (req, res, next) => {
//   try {
//     // Fetch department and branch hierarchy data
//     const hierarchyDepartment = await availableHierarchy(
//       req.payload,
//       "departments",
//       `
//         d.id AS departmentId,
//         d.parentId AS departmentParentId,
//         d.name AS departmentName,
//         d.level AS departmentLevel,
//         d.isDeleted,
//         d.isActive,
//         d.colorCode,
//         d.hierarchy,
//         d.createdBy,
//         d.editedBy,
//         d.createdAt,
//         d.updatedAt,
//         sh.id AS branchId,
//         sh.branchId AS securityHirarchyId,
//         sh.name AS branchName,
//         sh.type AS branchType,
//         sh.parentId AS branchParentId,
//         sh.level AS branchLevel
//       `,
//       "",
//       "d.hierarchy"
//     );
//     if (hierarchyDepartment && hierarchyDepartment.length > 0) {
//       // Group departments and attach branch data
//       const groupedData = hierarchyDepartment.reduce((acc, item) => {
//         const {
//           departmentId,
//           departmentParentId,
//           departmentName,
//           departmentLevel,
//           isDeleted,
//           isActive,
//           colorCode,
//           hierarchy,
//           createdBy,
//           editedBy,
//           createdAt,
//           updatedAt,
//           branchId,
//           branchName,
//           branchType,
//           branchParentId,
//           branchLevel,
//           securityHirarchyId
//         } = item;

//         // Find or create the department entry
//         let department = acc.find((dep) => dep.id === departmentId);
//         if (!department) {
//           department = {
//             id: departmentId,
//             parentId: departmentParentId,
//             name: departmentName,
//             level: departmentLevel,
//             isDeleted,
//             isActive,
//             colorCode,
//             hierarchy,
//             createdBy,
//             editedBy,
//             createdAt,
//             updatedAt,
//             branches: [],
//           };
//           acc.push(department);
//         }

//         // Add branch information if available
//         if (branchId) {
//           department.branches.push({
//             departmentId: department.id,
//             id: branchId,
//             name: branchName,
//             type: branchType,
//             parentId: department.id,
//             level: department.level,
//             hirarchybranchId: securityHirarchyId,
//           });
//         }

//         return acc;
//       }, []);

//       // Send the response
//       res.json(groupedData);
//     } else {
//       res.json({ success: false, message: "No Department found." });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error fetching departments." });
//   }
// });

router.get("/department", auth.required, async (req, res, next) => {
  try {
    // Query to fetch departments and associated branch data
    const query = `
      SELECT 
          d.id AS departmentId,
          d.parentId AS departmentParentId,
          d.name AS departmentName,
          d.level AS departmentLevel,
          d.isDeleted,
          d.isActive,
          d.colorCode,
          d.hierarchy,
          d.createdBy,
          d.editedBy,
          d.createdAt,
          d.updatedAt,
          COALESCE(sh.id, NULL) AS branchId,
          sh.name AS branchName,
          sh.type AS branchType,
          sh.parentId AS branchParentId,
          sh.level AS branchLevel,
          sh.branchId AS securityHierarchyId
      FROM 
          [dbo].[departments] d
      LEFT JOIN 
          [dbo].[department_hierarchy] dh ON d.id = dh.departmentId
      LEFT JOIN 
          [dbo].[security_hierarchies] sh ON dh.hierarchyId = sh.id
      WHERE 
          d.isDeleted = 0 -- Only active departments
      ORDER BY 
          d.id;
    `;

    // Execute the query
    const result = await execSelectQuery(query);

    if (result && result.length > 0) {
      // Group departments and attach branch data
      const groupedData = result.reduce((acc, item) => {
        const {
          departmentId,
          departmentParentId,
          departmentName,
          departmentLevel,
          isDeleted,
          isActive,
          colorCode,
          hierarchy,
          createdBy,
          editedBy,
          createdAt,
          updatedAt,
          branchId,
          branchName,
          branchType,
          branchParentId,
          branchLevel,
          securityHierarchyId,
        } = item;

        // Find or create the department entry
        let department = acc.find((dep) => dep.id === departmentId);
        if (!department) {
          department = {
            id: departmentId,
            parentId: departmentParentId,
            name: departmentName,
            level: departmentLevel,
            isDeleted,
            isActive,
            colorCode,
            hierarchy,
            createdBy,
            editedBy,
            createdAt,
            updatedAt,
            branches: [], // Initialize branches as an empty array
          };
          acc.push(department);
        }

        // Add branch information if available
        if (branchId) {
          department.branches.push({
            departmentId: department.id,
            id: branchId,
            name: branchName,
            type: branchType,
            parentId: department.id,
            level: branchLevel,
            hierarchyId: securityHierarchyId,
          });
        }

        return acc;
      }, []);

      // Send the response with the grouped department data
      res.json(groupedData);
    } else {
      res.json({ success: false, message: "No Department found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching departments." });
  }
});



router.post("/department", auth.required, async (req, res, next) => {
  req.body.hierarchy = "Central-001";
  const hierarchies = ["Central-001", "Super-001"];
  if (!hierarchies.includes(req.payload.hierarchy) && onlyForThisVendor(banks.rbb.name)) {
    return respond(res, "412", "You must be in central hierarchy to add Department.");
  }

  const department = req.body;
  try {
    // Check if the department already exists
    const departmentExists = await Department.findOne({
      where: { isDeleted: false, name: department.name, hierarchy: department.hierarchy },
    });

    if (departmentExists) {
      return respond(res, "409", "Department already exists.");
    }

    // Map incoming data to the expected Department model attributes
    const departmentData = {
      name: department.name,
      hierarchy: department.hierarchy,
      parentId: department.departmentParentId || 0, // Map departmentParentId to parentId
      level: department.level || 0, // Default level to 0 if not provided
      isDeleted: false,
      isActive: department.isActive || true, // Default isActive to true
      colorCode: department.colorCode || "#ffffff", // Default color code
      createdBy: req.payload.userId, // Use the authenticated user's ID for createdBy
      editedBy: req.payload.userId, // Initially the same as createdBy
    };

    // Create the department
    const newDepartment = await Department.create(departmentData);

    // Step 2: Generate the code for security_hierarchy as "Dept_<id>"

    let securityCode = `Dept_${newDepartment.id}`;
    if (department.name.includes("Audit")) {
      securityCode = `Super-${newDepartment.id}`
    }
    // Step 3: Insert a new record into the security_hierarchy table
    const newSecurityHierarchy = await SecurityHierarchy.create({
      code: securityCode,
      level: newDepartment.name.includes("Audit") ? newDepartment?.level : newDepartment?.level + 1,
      name: newDepartment?.name,
      branchId: null,
      parentId: req.body.parentId,
      departmentId: newDepartment?.id,
      multipleHierarchy: false, // Assuming default value; adjust if needed
      type: "department", // Assuming default type; adjust if needed
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    // Insert into department_hierarchy for multiple hierarchy IDs
    // if (req.body.hierarchyId && Array.isArray(req.body.hierarchyId)) {
    let hierarchyRecords;
    if (req.body.hierarchyId.length === 0) {
      hierarchyRecords = {
        departmentId: newDepartment.id,
        hierarchyId: null
      }
      await DepartmentHierarchy.create(hierarchyRecords); // Insert all hierarchyId associations
    } else {
      hierarchyRecords = req.body.hierarchyId.map((hierarchyId) => ({
        departmentId: newDepartment.id,
        hierarchyId,
      }));
      await DepartmentHierarchy.bulkCreate(hierarchyRecords); // Insert all hierarchyId associations
    }
    // }

    res.json({ success: true, message: "Department successfully created!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating department!" });
  }
});

router.put("/department", auth.required, async (req, res, next) => {
  req.body.hierarchy = "Central-001";
  const department = req.body;
  try {
    // // Check if a department with the same name and hierarchy already exists
    const departmentExists = await Department.findOne({
      where: { name: department.name, isDeleted: false, hierarchy: department.hierarchy },
    });

    if (departmentExists && departmentExists.id !== department.id) {
      return respond(res, "409", "Department with same name already exists");
    }
    // Map incoming data to the expected Department model attributes
    const departmentData = {
      name: department.name,
      hierarchy: department.hierarchy,
      parentId: department.departmentParentId || 0, // Map departmentParentId to parentId
      level: department.level || 0, // Default level to 0 if not provided
      isDeleted: false,
      isActive: department.isActive || true, // Default isActive to true
      colorCode: department.colorCode || "#ffffff", // Default color code
      createdBy: req.payload.userId, // Use the authenticated user's ID for createdBy
      editedBy: req.payload.userId, // Initially the same as createdBy
    };

    // Update the department
    await Department.update(departmentData, { where: { id: department.id } });

    // Step 2: Generate the code for security_hierarchy as "Dept_<id>"
    const securityCode = `Dept_${department.name + department.id}`;

    // Step 3: Update the record in the security_hierarchy table
    await SecurityHierarchy.update(
      {
        code: securityCode,
        level: department?.level + 1,
        name: department?.name,
        branchId: department?.branchId,
        parentId: req.body.parentId,
        departmentId: department?.id,
        multipleHierarchy: department?.multipleHierarchy || false, // Use existing or default value
        type: "department", // Assuming type is fixed
        updatedAt: new Date(),
      },
      { where: { departmentId: department.id } } // Ensure you're updating the correct record
    );
    // Synchronize department_hierarchy table for multiple hierarchy IDs
    if (req.body.hierarchyId && Array.isArray(req.body.hierarchyId)) {
      // Remove existing associations
      await DepartmentHierarchy.destroy({ where: { departmentId: department.id } });

      // Add new associations
      const hierarchyRecords = req.body.hierarchyId.map((hierarchyId) => ({
        departmentId: department.id,
        hierarchyId,
      }));
      await DepartmentHierarchy.bulkCreate(hierarchyRecords);
    }
    res.json({ success: true, message: "Department successfully updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating department!" });
  }
});

router.get("/department/:id", async (req, res, next) => {
  try {
    // Define associations if not already defined
    Department.hasMany(DepartmentHierarchy, { foreignKey: "departmentId" });
    DepartmentHierarchy.belongsTo(SecurityHierarchy, { foreignKey: "hierarchyId" });

    const department = await Department.findOne({
      where: { id: req.params.id, isDeleted: false },
      include: [
        {
          model: DepartmentHierarchy,
          include: [
            {
              model: SecurityHierarchy,
              attributes: ["id", "name", "type", "parentId", "level"],
            },
          ],
        },
      ],
    });

    if (!department) {
      return res.json({ success: false, message: "Department not found." });
    }

    // Map branches from department_hierarchies
    const branches = (department.department_hierarchies || []).map((hierarchy) => {
      if (hierarchy.security_hierarchy) {
        return {
          branchId: hierarchy.security_hierarchy.id,
          branchName: hierarchy.security_hierarchy.name,
          branchType: hierarchy.security_hierarchy.type,
          branchParentId: hierarchy.security_hierarchy.parentId,
          branchLevel: hierarchy.security_hierarchy.level,
        };
      }
      return null; // Handle case where security_hierarchy is missing
    }).filter(Boolean); // Remove null entries
    const securityHierarchyParent = await SecurityHierarchy.findOne({ where: { departmentId: req.params.id } });
    // Format response
    const responseData = {
      id: department.id,
      name: department.name,
      parentId: department.parentId,
      securityHierarchyId: securityHierarchyParent.parentId,
      level: department.level,
      colorCode: department.colorCode,
      hierarchy: department.hierarchy,
      isDeleted: department.isDeleted,
      isActive: department.isActive,
      createdAt: department.createdAt,
      updatedAt: department.updatedAt,
      branches,
    };
    res.json({ success: true, data: responseData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching department details." });
  }
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

// router.delete("/department/:id", auth.required, async (req, res, next) => {
//   deleteItem(
//     Department,
//     {
//       id: req.params.id,
//       type: DEPARTMENT,
//       from: "Department",
//       hasHierarchy: true,
//     },
//     req.payload,
//     (response) => {
//       res.send(response);
//     },
//     req
//   );
// });


router.delete("/department/:id", auth.required, async (req, res, next) => {
  try {
    // Begin transaction to ensure both deletions are atomic
    await sequelize.transaction(async (transaction) => {
      // Delete associated records from the DepartmentHierarchy table
      await DepartmentHierarchy.destroy({
        where: { departmentId: req.params.id },
        transaction,
      });

      // Delete the department record
      await Department.destroy({
        where: { id: req.params.id },
        transaction,
      });

      await SecurityHierarchy.destroy({
        where: { departmentId: req.params.id },
        transaction,
      });

    });

    res.json({ success: true, message: "Department and associated hierarchy records deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting department and associated records." });
  }
});

module.exports = router;
