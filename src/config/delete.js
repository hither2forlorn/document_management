/**
 * This module is used to check the eligibility of a user to delete items from the particular table
 *
 * @module DeleteModule
 */

const { User, DeleteLog } = require("./database");
const { getPermissions: getPermissionsUser } = require("../user-management/util/role");
const { getDocument } = require("../document-management/util/getModelDetail");
const { createLog, constantLogType } = require("../util/logsManagement");

/**
 * Must coincide with column names on the role/page_acess/other_access
 * This is used to check the permission to delete an item
 * @ignore
 */
module.exports.USER = "user";
module.exports.USER_STATUS = "userStatus";
module.exports.ROLE = "role";
module.exports.DEPARTMENT = "department";
module.exports.BRANCH = "branch";
module.exports.DOCUMENT = "document";
module.exports.ATTACHMENT = "attachment";
module.exports.LETTER = "letter";
module.exports.DOCUMENT_CONDITION = "documentCondition";
module.exports.DOCUMENT_TYPE = "documentType";
module.exports.DOCUMENT_INDEX = "documentIndex";
module.exports.LOCATION_MAP = "locationMap";
module.exports.LOCATION_TYPE = "locationType";
module.exports.LANGUAGE = "language";
module.exports.FORM = "form";
module.exports.MEMO = "memo";
module.exports.CLIENT = "client";

/**
 *
 * @param {Number}          userId
 * @param {Function}        callback  Callback function to call (err, permissions)
 *
 * @returns {permissions}   Permissions of a user
 */
function getPermissions(userId, callback) {
  User.findOne({
    where: { id: userId },
    raw: true,
  })
    .then((user) => {
      getPermissionsUser(user.roleId)
        .then((permissions) => {
          callback(null, permissions);
        })
        .catch((err) => {
          callback(err);
        });
    })
    .catch((err) => {
      callback(err);
    });
}

/**
 * Returns boolean checking the permission of user to delete the items
 *
 * @param {String}      item        Item name - eg: user, role, etc.
 * @param {Number}      userId      ID of the user login in
 * @param {Function}    callback    Returns Boolean
 *
 * @returns {Boolean} Returns true if the user can delete the data from particular table
 */
function canDelete(item, userId, callback) {
  getPermissions(userId, (err, permissions) => {
    if (!err && permissions[item] === 3) {
      callback(true);
    } else {
      callback(false);
    }
  });
}
/**
 * Returns document if it has the provided parentId determining if the document is the parent of any other  undeleted documents
 *
 * @param {*} Model         Model Object: eg: Department, SecurityHeirarchy
 * @param {*} parentId
 * @returns {Object}        an object with documents or null to check whether the passed id is the parentId of other undeleted documents
 */

async function childChecker(Model, parentId) {
  return await Model.findOne({
    where: {
      parentId: parentId,
      isDeleted: false,
    },
  });
}

/**
 * Handles the deleting of the item from the database
 *
 * @param {Model}     Model       Model Object - eg: User, Role, etc.
 * @param {String}    item        Item name - eg: user, role, etc.
 * @param {Object}    payload     Payload containing user data
 * @param {Function}  callback    Callback function for calling response data
 */
module.exports.deleteItem = async (Model, item, payload, callback, req) => {
  // cannot delet hierarchy of child hierarchy
  if (item?.hasHierarchy) {
    const result = await childChecker(Model, item.id);
    if (result) {
      callback({
        success: false,
        message: `${item.from ? item.from : item.type.toUpperCase()} is not empty`,
      });
      return;
    }
  }

  canDelete(item.type, payload.id, (canDelete) => {
    if (canDelete || item.isMaker) {
      Model.update(
        { isDeleted: true },
        {
          raw: true,
          where: { id: item.id },
        }
      )
        .then((_) => {
          if (req) createLog(req, item.type, item.id);

          DeleteLog.create({
            itemId: item.id,
            itemType: item.type,
            deletedOn: new Date(),
            deletedBy: payload.id,
          })
            .then((_) => {
              callback({ success: true });
            })
            .catch((err) => {
              console.log(err);
              callback({ success: false, message: "Server Error" });
            });
        })
        .catch((err) => callback(err));
    } else {
      callback({
        success: false,
        message: "You have no rights to delete !",
      });
    }
  });
};

/**
 * Handles the deleting of the item from the database
 *
 * @param {Model}     Model       Model Object - eg: User, Role, etc.
 * @param {String}    item        Item name - eg: user, role, etc.
 * @param {Object}    payload     Payload containing user data
 * @param {Function}  callback    Callback function for calling response data
 */
module.exports.deleteItemWithId = (Model, item, payload, callback, column) => {
  canDelete(item.type, payload.id, (canDelete) => {
    if (canDelete) {
      Model.update({ isDeleted: true }, { where: { [column]: item.id } })
        .then((_) => {
          DeleteLog.create({
            itemId: item.id,
            itemType: item.type,
            deletedOn: new Date(),
            deletedBy: payload.id,
          })
            .then((_) => {
              callback({ success: true });
            })
            .catch((err) => {
              console.log(err);
              callback({ success: false, message: "Server Error" });
            });
        })
        .catch((err) => callback(err));
    } else {
      callback({
        success: false,
        message: "You have no rights to delete !",
      });
    }
  });
};
