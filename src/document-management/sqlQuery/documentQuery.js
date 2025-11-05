
const { onlyForThisVendor, banks } = require("../../config/selectVendor");
const { securityLevelQuery, subordinateQuery, bottomHierarchyQuery } = require("./hierarchyQuery");

// #####################################################
// constant for query

const typeOptions = {
  archived: "archived",
  favourite: "favourite",
  pending: "pending",
};

// counts number of document
const countQuery = (user) => {
  return subordinateQuery(user) + `SELECT COUNT(DISTINCT d.id) as total`;
};

// paginate documents list
const handleBottomQuery = (offset, limit) => `
      ORDER BY d.createdAt DESC OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
        `;
// filter document
const handleBodyQuery = (filterText, textIndexFilter, user, type) => {
  // Type detection logic
  if (filterText.includes("d.isArchived=1")) type = "archived";
  if (filterText.includes("d.isDeleted=1")) type = "deleted";
  return `
    FROM documents d
    JOIN document_types dt ON d.documentTypeId = dt.id
    JOIN security_hierarchies sh ON sh.code = dt.hierarchy
    LEFT JOIN document_index_values div ON d.id = div.documentId
    LEFT JOIN document_indices di ON di.id = div.documentIndexId
    LEFT JOIN document_conditions dc ON d.documentConditionId = dc.id
    LEFT JOIN departments dpt ON dpt.id = d.departmentId
    LEFT JOIN location_maps lm ON d.locationMapId = lm.id
    LEFT JOIN users u ON d.createdby = u.id
    LEFT JOIN branches b ON b.id = d.branchId
    LEFT JOIN favourites f ON f.documentId = d.id
    LEFT JOIN tags t ON t.docId = d.id
    LEFT JOIN attachments a ON a.itemId = d.id
    WHERE
    d.isDeleted = ${type === "deleted" ? "1" : "0"}
    ${(user.roleId !== 1 && user.hierarchy !== "Super-002") ?
      (user.hierarchy.includes("Super") ?
        `AND d.hierarchy IN (
                SELECT sh.code FROM security_hierarchies sh
                JOIN users u ON u.hierarchy = sh.code
                WHERE u.id = ${user.id}
                UNION ALL
                SELECT sh2.code FROM security_hierarchies sh2
                JOIN security_hierarchies sh3 ON sh2.parentId = sh3.id
                WHERE sh3.code IN (
                    SELECT sh.code FROM security_hierarchies sh
                    JOIN users u ON u.hierarchy = sh.code
                    WHERE u.id = ${user.id}
                )
            )`
        :
        `AND (
                d.securityLevel != 2 OR (
                  (u.departmentId IS NOT NULL AND (
                    d.departmentId = (SELECT departmentId FROM users WHERE id = ${user.id})
                    OR d.branchId IN (
                      SELECT sh.branchId
                      FROM security_hierarchies sh
                      JOIN department_hierarchy dh ON dh.hierarchyId = sh.id
                      WHERE dh.departmentId = (SELECT departmentId FROM users WHERE id = ${user.id})
                      AND sh.code IN (
                          SELECT sh.code 
                          FROM security_hierarchies sh
                          JOIN users u ON u.hierarchy = sh.code
                          WHERE u.id = ${user.id}
                      )
                    )
                    AND d.hierarchy IN (
                        SELECT sh.code 
                        FROM security_hierarchies sh
                        JOIN users u ON u.hierarchy = sh.code
                        WHERE u.id = ${user.id}
                    )
                    AND d.isDeleted = 0
                  ))
                  OR (u.departmentId IS NULL AND u.branchId IS NOT NULL AND d.branchId = u.branchId)
                )
            )`
      )
      :
      ""}
    ${type === typeOptions.favourite ? `AND f.isfavourite = 1 AND f.ownerId = ${user.id}` : ""}
    ${type === typeOptions.archived ? "AND d.isArchived = 1" : "AND d.isArchived != 1 AND d.isApproved = 1"}
    ${filterText || ""}
    ${textIndexFilter || ""}
    ${bottomHierarchyQuery(user, "dont_reverse", "", "document")}
  `;
};
// #####################################################
// End of constants

/**
 * Search and filter
 */

const searchHeaderQuery = (user) =>
  subordinateQuery(user) +
  `select DISTINCT d.id, d.isDeleted, d.isApproved, d.hasEncryption, d.hasQuickQcr, d.hasOtp, d.createdAt, d.updatedAt, dt.name DocumentType, d.name OrganizationName, d.otherTitle DocumentName, dpt.name Department, b.name Branch, d.securityLevel, lm.name locationMap,
  case when d.statusId = 1 then 'Active' when d.statusId = 2 then 'checked out' when d.statusId = 3 then 'Suspended' else 'Unknown' end DocumentStatus, u.username
  `;

function querySearchAndFilter(user, offset, limit, filterText, textIndexFilter) {
  /**
   * query: get paginated data
   * total: get total document
   */
  return {
    query:
      searchHeaderQuery(user) +
      handleBodyQuery(filterText, textIndexFilter, user, (type = "isDeleted")) +
      handleBottomQuery(offset, limit),
    total: countQuery(user) + handleBodyQuery(filterText, textIndexFilter, user),
  };
}

/**
 * Execute when visit documnet page.
 */
function queryLoadDocuments(user, offset, limit, isSearchingParameters) {
  return {
    query: searchHeaderQuery(user) + handleBodyQuery("", "", user) + handleBottomQuery(offset, limit),
    total: countQuery(user) + handleBodyQuery("", "", user),
  };
}

/**
 * Execute when visit archived page.
 */
function queryArchivedDocuments(user, offset, limit) {
  const topQuery =
    subordinateQuery(user) +
    `
  select DISTINCT d.id, d.hasEncryption, d.hasQuickQcr, d.hasOtp, b.name Branch, d.createdAt, dt.name DocumentType, d.returnedByChecker, d.name OrganizationName, d.otherTitle DocumentName, dpt.name Department, d.securityLevel, lm.name locationMap,
  case when d.statusId = 1 then 'Active' when d.statusId = 2 then 'checked out' when d.statusId = 3 then 'Suspended' else 'Unknown' end DocumentStatus, u.username
  `;

  return {
    query: topQuery + handleBodyQuery("", "", user, typeOptions.archived) + handleBottomQuery(offset, limit),
    total: countQuery(user) + handleBodyQuery("", "", user, typeOptions.archived),
  };
}
/**
 * Execute when visit favourite page.
 */
function queryFavouriteDocuments(user, offset, limit) {
  const topQuery =
    subordinateQuery(user) +
    `
  select DISTINCT d.id, d.hasEncryption, d.createdAt, dt.name DocumentType, b.name Branch, d.name OrganizationName, d.otherTitle DocumentName, dpt.name Department, d.securityLevel, lm.name locationMap, f.isfavourite,
  case when d.statusId = 1 then 'Active' when d.statusId = 2 then 'checked out' when d.statusId = 3 then 'Suspended' else 'Unknown' end DocumentStatus, u.username
  `;

  return {
    query: topQuery + handleBodyQuery("", "", user, typeOptions.favourite),
    // +
    // handleBottomQuery(offset, limit)
    total: countQuery(user) + handleBodyQuery("", "", user, typeOptions.favourite),
  };
}

/**
 * Execute when visit Pending page.
 */
function queryPendingDocuments(user, hasRoleTypeId, offset, limit) {
  let query = "";
  let pendingCountQuery = "";

  // Check if user is Department Admin
  if (hasRoleTypeId && user.departmentId) {
    query = `
      SELECT DISTINCT d.*,
  (CASE WHEN d.createdBy = ${user.id} THEN 1 ELSE 0 END) AS isUserChecker,
    u_creator.name AS createdByUser, --Creator's name
u_creator.email AS createdByEmail, --Creator's email
u_assigned.name AS assignedToUser, --Assigned user's name
u_assigned.email AS assignedToEmail, --Assigned user's email
u_approver.name AS verifierUser, --Verifier(approver) name
u_approver.email AS verifierEmail, --Verifier(approver) email
CASE
          WHEN d.sendToApprover = 1 THEN
CONCAT(u_approver.name, ' (', u_approver.email, ')')-- Show verifier(approver) details
ELSE
CONCAT(u_assigned.name, ' (', u_assigned.email, ')')-- Show assigned checker's details
        END AS assignTo,
  am.type
      FROM documents d
      JOIN approval_masters am ON am.documentId = d.id
      JOIN approval_queues aq ON aq.approvalMasterId = am.id
      JOIN users u_creator ON u_creator.id = d.createdBy-- Fetch creator's details
      JOIN users u_assigned ON u_assigned.id = am.assignedTo-- Fetch assigned checker's details
      LEFT JOIN users u_approver ON u_approver.id = am.approverId-- Fetch verifier(approver) details
      WHERE d.isApproved = 0 -- Exclude approved documents
        AND d.isArchived = 0
        AND d.isDeleted = 0
        AND am.isActive = 1
AND(
  (am.type = 'document' AND d.sendToChecker = 1 AND aq.isApprover = 1)-- Documents assigned to checker
OR(am.type = 'attachment' AND(am.assignedTo = ${user.id} OR am.initiatorId = ${user.id}))-- Attachments approvals
OR(am.type = 'document' AND d.sendToApprover = 1 AND am.approverId = ${user.id})-- Pending approvals
        )
AND(
  d.createdBy = ${user.id} -- User's own documents
          OR d.departmentId IN(
    SELECT id FROM departments WHERE parentId = ${user.departmentId} OR id = ${user.departmentId}
  )-- Documents from department and sub - departments
)
  `;
  } else {
    // Default Query for Maker, Checker, and Approver
    query = `
-- Documents assigned to checker or sent to approver, visible to maker or checker
    SELECT DISTINCT
      d.*,
      (CASE WHEN d.createdBy = ${user.id} THEN 1 ELSE 0 END) AS isUserChecker,
      CASE
        WHEN d.sendToApprover = 1 THEN
  (SELECT CONCAT(u.name, ' (', u.email, ')') FROM users u WHERE u.id = am.approverId)-- Approver's name and email
ELSE
CONCAT(u.name, ' (', u.email, ')')-- Checker's name and email
      END AS assignTo,
  am.type
    FROM documents d
    JOIN approval_masters am ON am.documentId = d.id
    JOIN approval_queues aq ON aq.approvalMasterId = am.id
    JOIN users u ON u.id = am.assignedTo
    WHERE d.isApproved = 0
      AND d.isArchived = 0
      AND d.isDeleted = 0
      AND aq.isApprover = 1
AND(d.returnedByChecker IS NULL OR d.returnedByChecker = 0)-- Exclude rejected by checker
AND(d.returnedByApprover IS NULL OR d.returnedByApprover = 0)-- Exclude rejected by approver
      AND d.sendToChecker = 1
AND(d.sendToApprover = 0 OR am.assignedTo = ${user.id})-- Include documents sent to checker or assigned to user
      AND am.type = 'document'
AND(aq.userId = ${user.id} OR d.createdBy = ${user.id})-- Include documents created by maker
 
    UNION ALL
   
    -- Used for attachment approval, visible to maker or assigned checker
    SELECT DISTINCT
      d.*,
      (CASE WHEN d.createdBy = ${user.id} THEN 1 ELSE 0 END) AS isUserChecker,
      CONCAT(u.name, ' (', u.email, ')') AS assignTo, -- Name and email for attachment approval
      am.type
    FROM approval_masters am
    JOIN documents d ON d.id = am.documentId
    JOIN users u ON u.id = d.createdBy
    WHERE am.type = 'attachment'
AND(am.assignedTo = ${user.id} OR am.initiatorId = ${user.id})
      AND d.isDeleted = 0
      AND am.isActive = 1
AND(d.returnedByChecker = 0 OR d.returnedByChecker IS NULL)-- Exclude rejected by checker
AND(d.returnedByApprover = 0 OR d.returnedByApprover IS NULL)-- Exclude rejected by approver
 
    UNION ALL
 
    -- Pending documents sent from checker to approver, visible to maker
    SELECT DISTINCT
      d.*,
      (CASE WHEN d.createdBy = ${user.id} THEN 1 ELSE 0 END) AS isUserChecker,
      (SELECT CONCAT(u.name, ' (', u.email, ')') FROM users u WHERE u.id = am.approverId) AS assignTo, -- Approver's name and email
      am.type
    FROM approval_masters am
    JOIN documents d ON d.id = am.documentId
    JOIN users u ON u.id = d.createdBy
    WHERE am.type = 'document'
      AND d.isDeleted = 0
      AND am.isActive = 1
AND(d.returnedByApprover = 0 OR d.returnedByApprover IS NULL)-- Exclude rejected by approver
      AND d.sendToApprover = 1
AND(d.returnedByChecker = 0 OR d.returnedByChecker IS NULL)-- Exclude rejected by checker
AND(am.approverId = ${user.id} OR d.createdBy = ${user.id})-- Include approver and maker    
  `}

  pendingCountQuery = `SELECT COUNT(*) AS total FROM(${query}) AS pendingDocuments`;

  return {
    query: query + handleBottomQuery(offset, limit),
    total: pendingCountQuery,
  };
}
/**
 * Execute when visit Rejected page.
 */
function queryRejectedDocuments(user, hasRoleTypeId, offset, limit) {
  let query = "";
  let rejectedCountQuery = "";

  // If user is a Department Admin, fetch branches under their department
  if (hasRoleTypeId && user.departmentId) {
    // Department Admin Query: Fetch rejected documents under their department hierarchy
    query = `
      SELECT DISTINCT d.*,
  (CASE WHEN d.createdBy = ${user.id} THEN 1 ELSE 0 END) AS isUserChecker,
    u_creator.name AS createdByUser, --Creator's name
u_creator.email AS createdByEmail, --Creator's email
u_assigned.name AS assignedToUser, --Assigned user's name
u_assigned.email AS assignedToEmail, --Assigned user's email
u_checker.name AS rejectedByChecker, --Name of the checker who rejected
u_checker.email AS rejectedByCheckerEmail, --Email of the checker who rejected
u_approver.name AS rejectedByApprover, --Name of the approver who rejected
u_approver.email AS rejectedByApproverEmail, --Email of the approver who rejected
CASE
          WHEN d.returnedByChecker = 1 THEN CONCAT(u_checker.name, ' (', u_checker.email, ')')-- Rejected by checker
          WHEN d.returnedByApprover = 1 THEN CONCAT(u_approver.name, ' (', u_approver.email, ')')-- Rejected by approver
          ELSE NULL
        END AS rejectedBy,
  am.type
      FROM documents d
      JOIN approval_masters am ON am.documentId = d.id
      JOIN approval_queues aq ON aq.approvalMasterId = am.id
      JOIN users u_creator ON u_creator.id = d.createdBy-- Fetch creator's details
      JOIN users u_assigned ON u_assigned.id = am.assignedTo-- Fetch assigned checker's details
      LEFT JOIN users u_checker ON u_checker.id = am.assignedTo-- Fetch checker's details for rejection
      LEFT JOIN users u_approver ON u_approver.id = am.approverId-- Fetch approver's details for rejection
      WHERE d.isApproved = 0 -- Only include unapproved documents
        AND d.isArchived = 0
        AND d.isDeleted = 0
        AND am.isActive = 1
AND(
  --Documents rejected by checker, visible to maker
  (d.returnedByChecker = 1)
          OR
          --Documents rejected by approver, visible to checker and approver
  (d.returnedByApprover = 1)
)
AND(
  d.createdBy = ${user.id} -- User's own documents
          OR d.departmentId IN(
    SELECT id FROM departments WHERE parentId = ${user.departmentId} OR id = ${user.departmentId}
  )-- Include documents from the department hierarchy
)
  `;
  } else {
    // Default query for users who are not department admins
    query = `
    SELECT DISTINCT
d.*,
  CASE
--If rejected by checker, fetch the checker's email
        WHEN d.returnedByChecker = 1 THEN
  (SELECT u.email FROM users u WHERE u.id = am.assignedTo)
--If rejected by approver, fetch the approver's email
        WHEN d.returnedByApprover = 1 THEN
  (SELECT u.email FROM users u WHERE u.id = am.approverId)
        ELSE NULL
      END AS rejectedByEmail
    FROM documents d
    JOIN approval_masters am ON am.documentId = d.id
    JOIN approval_queues aq ON aq.approvalMasterId = am.id
    WHERE d.isApproved = 0 -- Only include unapproved documents
      AND d.isArchived = 0
      AND d.isDeleted = 0
      AND am.isActive = 1
AND(
  --Documents rejected by checker, visible to maker
  (d.returnedByChecker = 1 AND(am.initiatorId = ${user.id} OR am.assignedTo = ${user.id}))
        OR
        --Documents rejected by approver, visible to checker and approver
  (d.returnedByApprover = 1 AND aq.userId = ${user.id} AND(aq.level = 0 OR aq.level = 1 OR aq.level = 2))
)
  `;
  }

  rejectedCountQuery = `
    SELECT COUNT(DISTINCT d.id) AS total
    FROM documents d
    JOIN approval_masters am ON am.documentId = d.id
    JOIN approval_queues aq ON aq.approvalMasterId = am.id
    WHERE d.isApproved = 0 -- Only include unapproved documents
      AND d.isArchived = 0
      AND d.isDeleted = 0
      AND am.isActive = 1
AND(
  --Documents rejected by checker, visible to maker
  (d.returnedByChecker = 1 AND(am.initiatorId = ${user.id} OR am.assignedTo = ${user.id}))
        OR
        --Documents rejected by approver, visible to checker and approver
  (d.returnedByApprover = 1 AND aq.userId = ${user.id} AND(aq.level = 1 OR aq.level = 2))
)
  `;

  return {
    query: query + handleBottomQuery(offset, limit),
    total: rejectedCountQuery,
  };
}

/**
 * Execute when visit Saved page.
 */
function querySavedDocuments(user, offset, limit) {
  const query = `
		select distinct d.* from documents d
join approval_masters am on am.documentId = d.id
join approval_queues aq on aq.approvalMasterId = am.id
where d.isApproved = 0 and  d.isDeleted = 0 and isArchived = 0 and(d.sendToChecker = 0 or d.sendToChecker is null) and returnedByChecker != 1 and am.initiatorId = ${user.id} `;

  const savedCountQuery = `select COUNT(d.id) as total from documents d
join approval_masters am on am.documentId = d.id
join approval_queues aq on aq.approvalMasterId = am.id
where d.isApproved = 0 and d.isDeleted = 0 and isArchived = 0 and(d.sendToChecker = 0 or d.sendToChecker is null) and returnedByChecker != 1 and am.initiatorId = ${user.id} `;

  return {
    query: query + handleBottomQuery(offset, limit),
    total: savedCountQuery,
  };
}

module.exports = {
  querySearchAndFilter,
  queryLoadDocuments,
  queryRejectedDocuments,
  queryArchivedDocuments,
  queryFavouriteDocuments,
  queryPendingDocuments,
  subordinateQuery,
  querySavedDocuments,
};
