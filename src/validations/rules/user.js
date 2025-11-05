const { userCannotDO, adminCanAssignSuperRole } = require("./utils");

const validSameUserRole = async (value, { req }) => {
  await userCannotDO(req, "roleId");
  await adminCanAssignSuperRole(req);
};

const validUserDepartmentIdAndBranchId = async (value, { req }) => {
  // await userCannotDO(req, "roleId");
  if (!req.body.branchId && !req.body.departmentId) return await Promise.reject(`Please Select a department or branch.`);
};

const validSameUserHierarchy = async (value, { req }) => {
  await userCannotDO(req, "hierarchy");
};

module.exports = {
  validSameUserRole,
  validSameUserHierarchy,
  validUserDepartmentIdAndBranchId,
};
