/**
 * @module DocumentSecurityModule
 */
const { User, Department, DocumentAccessUser } = require("../config/database");

/**
 * Method to pass the document list and userId
 *
 * @method module:DocumentSecurityModule#canViewTheDocument
 * @param {Number} userId              - User id to check the access rights of the document
 * @param {Array<Object>} documentList - List of the document to check whether the user has access to it or not
 *
 * @returns The list of the documents which can be viewed by the particular user
 */
async function canViewTheDocument(userId, documentList) {
  const [{ roleId, departmentId }, departments, documentAccessUsers] = await Promise.all([
    getUser(userId),
    getDepartments(),
    getDocumentAccessUser(userId),
  ]);
  let finalDoc;

  checkRole(roleId, (isAdmin) => {
    if (isAdmin) {
      finalDoc = documentList;
    } else {
      finalDoc = [];
      documentList.forEach((doc) => {
        switch (doc.securityLevel) {
          case 1:
            finalDoc.push(doc);
            break;
          case 2:
            if (doc.ownerId === userId) {
              finalDoc.push(doc);
            } else {
              checkDepartment(departmentId, doc.departmentId, departments, (isAccessible) => {
                if (isAccessible) finalDoc.push(doc);
              });
            }
            break;
          case 3:
            if (doc.ownerId === userId) {
              finalDoc.push(doc);
            } else {
              checkUserAuthorityToTheDocument(doc.id, documentAccessUsers, (isUserAccess) => {
                if (isUserAccess) finalDoc.push(doc);
              });
            }
            break;
          default:
            finalDoc.push(doc);
            break;
        }
      });
    }
  });
  return finalDoc;
}

function getUser(id) {
  return User.findOne({
    where: id,
    raw: true,
    attributes: ["departmentId", "roleId"],
  });
}

function getDepartments() {
  return Department.findAll({
    attributes: ["id", "level", "parentId"],
    raw: true,
  });
}

/**
 *
 * @param {Number} userId
 * @returns Gets the list of access rights for the particular user for the documents which has securityLevel = 3
 */
function getDocumentAccessUser(userId) {
  return DocumentAccessUser.findAll({
    where: { isActive: true, userId: userId },
    attributes: ["documentId"],
    raw: true,
  });
}

function checkRole(userRole, callback) {
  // Checking by the user role whether the user is admin or not so that he/she can view all the documents disregarding their department
  if (userRole === 1) callback(true);
  else callback(false);
}

/**
 * This functions checks for **`securityLevel = 2`**
 * whether the document can be accessed by the particular user or not
 * @alias HierarchialLevelSecurityLevel2
 * @method module:DocumentSecurityModule#checkDepartment
 * @param {Number} userDept  Department ID of the user
 * @param {Number} documentDept  Department ID of the document
 * @param {Array<Object>} departments  List of departments
 * @param {Function} callback Callback function returning true/false
 */
function checkDepartment(userDept, documentDept, departments, callback) {
  if (userDept === documentDept) {
    callback(true);
  } else {
    const userDeptChildren = checkChildren(userDept, departments);
    if (userDeptChildren?.filter((uDept) => (uDept.id === documentDept ? 1 : 0)).length > 0) {
      callback(true);
    }
    callback(false);
  }
}

function checkChildren(deptId, departments) {
  const dept = departments.filter((d) => (d.id === deptId ? 1 : 0))[0];
  if (dept) {
    const children = departments.filter((d) => (d.parentCategoryId === deptId ? 1 : 0));
    children.forEach((item) => {
      children.concat(checkChildren(item.id, departments));
    });
    return children;
  } else {
    return null;
  }
}

/**
 * This functions checks for **`securityLevel = 3`**
 * whether the document can be accessed by the particular user or not
 *
 * @alias HighLevelSecurityLevel3
 * @method module:DocumentSecurityModule#checkDepartment
 * @param {Number} documentId  Document Id
 * @param {Array<Object>} documentAccessUsers
 * @param {Function} callback Callback function returning true/false
 */
function checkUserAuthorityToTheDocument(documentId, documentAccessUsers, callback) {
  documentAccessUsers.forEach((d) => {
    if (d.documentId === documentId) {
      callback(true);
    }
  });
  callback(false);
}

module.exports = {
  canViewTheDocument,
  getUser,
  getDepartments,
  getDocumentAccessUser,
  checkChildren,
};
