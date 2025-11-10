const { RoleControl } = require("../../config/database");

// RoleUtils object contains utility functions related to roles
const RoleUtils = {
  // checkDormantPrivilege checks if a role has dormant privilege
  checkDormantPrivilege: async (roleId) =>
    // Finding the RoleControl entry with the specified roleId and roleTypeId of 21
    (await RoleControl.findOne({ where: { roleId, roleTypeId: 21 }, raw: true }))?.value === "true",

  //   checkHardDeletePrivilege: async (roleId) =>
  //     // Finding the RoleControl entry with the specified roleId and roleTypeId of 21
  //     (await RoleControl.findOne({ where: { roleId, roleTypeId: 22 }, raw: true })).value === "true",
};

module.exports = RoleUtils;
