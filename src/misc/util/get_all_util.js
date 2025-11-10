const { DocumentType, DocumentTypeIndex, Branch } = require("../../config/database");
const { dms_features } = require("../../config/selectVendor");
const branchAndDepartmentQuery = require("../../document-management/sqlQuery/branchAndDepartmentQuery");
const isSuperAdmin = require("../../document-management/sqlQuery/isSuperAdmin");
const { execSelectQuery } = require("../../util/queryFunction");

/**
 * Checker list
 *
 * @param {*} req
 * @param {*} users
 * @returns
 */
const filterCheckerList = async (req, users, excludeChecker) => {
  const userAttributes = [
    "u.email",
    "u.id",
    "u.name",
  ].join(", ");

  const query = `
    SELECT DISTINCT ${userAttributes}  from users u 
    join roles r on r.id =u.roleId 
    join role_controls rc on rc.roleId =r.id 
    join role_types rt on rt.id =rc.roleTypeId 
    where rc.value ='true' 
    and u.isActive =1 and u.statusId =1 and u.id != ${req.payload.id}
    ${!excludeChecker ? "and rc.roleTypeId =17 -- checker role id in roles table" : ""} 
    `;

  const tempUser = await execSelectQuery(query);

  const user_temp = users.map((row) => row.id);

  const result = tempUser.filter((row) => user_temp.includes(row.id));

  return result;
};

/**
 * list Document Type
 * @param {request} req
 * @returns
 */
async function DocumentTypeData(req) {
  const userId = req.payload.id;
  const docTypes = await DocumentType.findAll({
    where: { isDeleted: false },
    include: [{ model: DocumentTypeIndex, required: false }],
    order: [["name", "ASC"]],
  });

  // for gentech user(admin and binaya) --bank confidential
  if (userId === 1 || userId === 611) {
    return docTypes.filter((doc) => doc.name !== "Compliance Department" && doc.name !== "Operation Department");
  }

  const headQuery = `SELECT  DISTINCT dt.id from document_types dt
    ${userId != 1 ? "JOIN security_hierarchies sh on sh.code =dt.hierarchy" : ""}
    WHERE dt.isDeleted=0 `;

  // branch and department query
  const query = branchAndDepartmentQuery(userId, headQuery, "", true, req.payload.hierarchy);

  const data = await execSelectQuery(query);

  // include data only in hierarchy
  const result = docTypes.filter((row) => {
    const list = data.map((element) => {
      return element.id;
    });
    if (list.includes(row.id)) {
      return true;
    } else false;
  });

  return req.payload.id != 1 || dms_features.DocumentType_IN_HIRARCHY ? result : docTypes;
}

/**
 * list branch data
 * @param {request} req
 * @returns
 */
async function BranchData(req) {
  const user = req.payload;
  let data = [];

  if (isSuperAdmin(user)) {
    data = await Branch.findAll({
      where: { isDeleted: false },
    });
  } else {
    data = await Branch.findAll({
      where: {
        isDeleted: false,
        id: user?.branchId || "",
      },
    });
  }
  return data;
}

module.exports = { filterCheckerList, DocumentTypeData, BranchData };
