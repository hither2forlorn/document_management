const isSuperAdmin = require("../../document-management/sqlQuery/isSuperAdmin");
const sameUser = require("../../user-management/util/sameUser");

/**
 *
 * function for same user cannot do => security purpose
 * @param {*} req
 * @param {*} column
 * @returns
 */
const userCannotDO = async (req, column) => {
  const updateUser = req.body;
  if (updateUser[column] && sameUser(req, updateUser.id)) return await Promise.reject(`You cannot edit your ${column}.`);
};

const adminCanAssignSuperRole = async (req) => {
  const updateUser = req.body;
  if (!isSuperAdmin(req.payload)) {
    if (updateUser.roleId == 1) return await Promise.reject(`You cannot assign super admin role`);

    if (updateUser.hierarchy == "Super-001") return await Promise.reject(`You cannot assign  Super hierarchy`);
  }
};

module.exports = { userCannotDO, adminCanAssignSuperRole };
