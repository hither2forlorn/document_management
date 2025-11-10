const { consoleLog } = require("../../util");
const isSuperAdmin = require("../sqlQuery/isSuperAdmin");
const { getDocument } = require("../util/getModelDetail");
/**
 * Middleware
 *
 * @param {*} req request
 * @param {*} res response
 * @param {*} next next
 */
function edit_delete_document(req, res, next) {
  const user = req.payload;
  const doc = req.body;
  const errorMessage = "You cannot Edit,Upload or Delete the document.";
  let userInSameDeptOrBranch = false;
  if (user.id == 1) {
    return next();
  }
  consoleLog("user and doc=", user.branchId, user.departmentId, doc.branchId, doc.departmentId);

  if (doc?.departmentId && user?.branchId) userInSameDeptOrBranch = true;
  if (doc?.branchId && user?.departmentId) userInSameDeptOrBranch = true;
  if (doc?.departmentId != user?.departmentId) userInSameDeptOrBranch = true;
  if (doc?.branchId != user?.branchId) userInSameDeptOrBranch = true;

  if (userInSameDeptOrBranch) return res.send({ success: false, message: errorMessage });

  next();
}

// used
async function validateUserIsInSameDomain(user, docId, isAttachId = false) {
  const errorMessage = "You cannot Edit,Upload or Delete the document. You  must be in same domain";
  let userInSameDeptOrBranch = false;

  if (isSuperAdmin(user)) return false;

  const document = await getDocument(docId, isAttachId);
  const doc = isAttachId ? document : document.dataValues;

  // if (doc?.departmentId && user?.branchId) userInSameDeptOrBranch = true;
  // if (doc?.branchId && user?.departmentId) userInSameDeptOrBranch = true;
  if (doc?.departmentId != user?.departmentId) userInSameDeptOrBranch = true;
  if (doc?.branchId != user?.branchId) userInSameDeptOrBranch = true;

  if (userInSameDeptOrBranch) return errorMessage;
  else return false;
}

module.exports = { edit_delete_document, validateUserIsInSameDomain };
