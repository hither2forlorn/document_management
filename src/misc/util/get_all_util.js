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
  const query = `
    SELECT DISTINCT u.*  
    FROM users u
    JOIN roles r ON r.id = u.roleId
    JOIN role_controls rc ON rc.roleId = r.id
    JOIN role_types rt ON rt.id = rc.roleTypeId
    WHERE rc.value = 'true'
    AND u.isActive = 1
    AND u.statusId = 1
    AND u.id != ${req.payload.id}
    ${!excludeChecker ? "AND rc.roleTypeId = 17 -- checker role id in roles table" : ""}
  `;

  const tempUser = await execSelectQuery(query);

  const user_temp = users.map((row) => row.id);

  // Get the current user's branchId and departmentId from the payload
  const currentUser = users.find((user) => user.id === req.payload.id);
  const currentBranchId = currentUser ? currentUser.branchId : null;
  const currentDepartmentId = currentUser ? currentUser.departmentId : null;

  // Filter the tempUser list based on the current user's branchId and departmentId
  const result = tempUser.filter((row) => {
    const userMatches = user_temp.includes(row.id);

    if (userMatches) {
      // Handle matching logic for branchId and departmentId
      const tempUser = users.find((user) => user.id === row.id);
      if (tempUser) {
        // If the current user has both branchId and departmentId
        if (currentBranchId && currentDepartmentId) {
          // Both branchId and departmentId must match
          return tempUser.branchId === currentBranchId && tempUser.departmentId === currentDepartmentId;
        }
        else if (currentDepartmentId) {
          return tempUser.departmentId === currentDepartmentId;
        }
        // If the current user only has branchId
        else if (currentBranchId) {
          // Only branchId must match
          return tempUser.branchId === currentBranchId;
        }
      }
    }

    return false;
  });

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

  const headQuery = `SELECT  DISTINCT dt.id from document_types dt
    ${userId != 1 ? "JOIN security_hierarchies sh on sh.code =dt.hierarchy JOIN department_hierarchy dh on dh.hierarchyId = sh.id" : ""}
    WHERE dt.isDeleted=0 `;

  // branch and department query
  // const query = branchAndDepartmentQuery(userId, headQuery, "", true, req.payload.hierarchy);
  // const data = await execSelectQuery(query);

  const reqDocTypeQuery =
    `WITH UserDetails AS ( 
  SELECT id, departmentId, branchId, roleId
  FROM users
  WHERE id = ${userId}
),
BranchDepartment AS (
  SELECT DISTINCT dh.departmentId
  FROM branches b
  JOIN security_hierarchies sh ON sh.branchId = b.id
  JOIN department_hierarchy dh ON sh.id = dh.hierarchyId
  JOIN UserDetails u ON b.id = u.branchId
)
SELECT 
  dt.id AS dt_id, dt.isDeleted AS dt_isDeleted, dt.name AS dt_name, dt.level, 
  dt.isAssociatedIDReq, dt.parentId, dt.active, dt.hierarchy, dt.createdBy, 
  dt.editedBy, dt.uploadOptional, dt.createdAt AS dt_createdAt, dt.updatedAt AS dt_updatedAt,
  
  dti.id AS dti_id, dti.isDeleted AS dti_isDeleted, dti.dataType, dti.docId, dti.label, 
  dti.type, dti.enum, dti.apiUrl, dti.validation, dti.condition, dti.isRequired, 
  dti.isShownInAttachment, dti.createdAt AS dti_createdAt, dti.updatedAt AS dti_updatedAt

FROM document_types dt
JOIN security_hierarchies sh ON sh.code = dt.hierarchy
LEFT JOIN department_hierarchy dh ON dh.hierarchyId = sh.id
LEFT JOIN document_indices dti ON dt.id = dti.docId -- JOIN document_indices

WHERE dt.isDeleted = 0
AND (
  sh.departmentId IN (SELECT departmentId FROM UserDetails)
  OR sh.branchId IN (SELECT branchId FROM UserDetails)
  OR sh.departmentId IN (SELECT departmentId FROM BranchDepartment)
  OR (SELECT roleId FROM UserDetails) = 1
)`

  const reqDocTypeData = await execSelectQuery(reqDocTypeQuery);

  // include data only in hierarchy
  // const result = docTypes.filter((row) => {
  //   const list = data.map((element) => {
  //     return element.id;
  //   });
  //   if (list.includes(row.id)) {
  //     return true;
  //   } else false;
  // });
  const formattedData = reqDocTypeData.reduce((acc, row) => {
    let docType = acc.find(doc => doc.id === row.dt_id);

    if (!docType) {
      // Create a new document type entry
      docType = {
        id: row.dt_id,
        isDeleted: row.dt_isDeleted,
        name: row.dt_name,
        level: row.level,
        isAssociatedIDReq: row.isAssociatedIDReq,
        parentId: row.parentId,
        active: row.active,
        hierarchy: row.hierarchy,
        createdBy: row.createdBy,
        editedBy: row.editedBy,
        uploadOptional: row.uploadOptional,
        createdAt: row.dt_createdAt,
        updatedAt: row.dt_updatedAt,
        document_indices: [] // Initialize empty array
      };
      acc.push(docType);
    }

    // Add document_indices only if present
    if (row.dti_id) {
      docType.document_indices.push({
        id: row.dti_id,
        isDeleted: row.dti_isDeleted,
        dataType: row.dataType,
        docId: row.docId,
        label: row.label,
        type: row.type,
        enum: row.enum,
        apiUrl: row.apiUrl,
        validation: row.validation,
        condition: row.condition,
        isRequired: row.isRequired,
        isShownInAttachment: row.isShownInAttachment,
        createdAt: row.dti_createdAt,
        updatedAt: row.dti_updatedAt
      });
    }

    return acc;
  }, []);


  return req.payload.id != 1 ? formattedData : docTypes;

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
