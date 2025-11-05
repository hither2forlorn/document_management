const { Role, RoleControl, RoleType } = require("../../config/database");

/**
 * @method UserManagement#getPermissions
 * @param {Number} roleId Role id of the user whose access rights to be retrieved
 * @returns The access rights for the particular roleId
 */
async function getPermissions(roleId) {
  if (!roleId) return {};
  Role.hasMany(RoleControl);
  RoleControl.belongsTo(RoleType);
  return await Role.findOne({
    include: [
      {
        model: RoleControl,
        required: false,
        include: [
          {
            model: RoleType,
          },
        ],
      },
    ],
    where: {
      id: roleId,
    },
  }).then((role) => {
    const permissions = {};
    if (role?.role_controls) {
      role.role_controls.forEach((rC) => {
        const roleType = rC.role_type;
        switch (roleType.type) {
          case "boolean":
            permissions[roleType.key] = rC.value === "true" ? true : false;
            break;
          default:
            permissions[roleType.key] = Number(rC.value);
            break;
        }
      });
    }
    return permissions;
  });
}

module.exports = {
  getPermissions,
};
