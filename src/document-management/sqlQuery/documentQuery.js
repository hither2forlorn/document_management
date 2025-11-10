const { onlyForThisVendor, banks } = require("../../config/selectVendor");
const { securityLevelQuery, subordinateQuery, bottomHierarchyQuery, subordinateSubQuery } = require("./hierarchyQuery");

// #####################################################
// constant for query

const typeOptions = {
  archived: "archived",
  favourite: "favourite",
  pending: "pending",
};

// counts number of document
const countQuery = (user) => {
  return subordinateSubQuery(user) + `SELECT COUNT(DISTINCT d.id) as total`;
};

// paginate documents list
const handleBottomQuery = (offset, limit) => `
      ORDER BY d.createdAt DESC OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
        `;

// filter document
// filter document
const handleBodyQuery = (filterText, textIndexFilter, user, type, onLoad) => {
  // find archieved text in query from filter text
  if (filterText.includes("d.isArchived=1") === true) {
    type = "archived";
  }
  // find deleted text in query from filter text
  if (filterText.includes("d.isDeleted=1") === true) {
    type = "deleted";
  }
  return `
      FROM documents d
      JOIN document_types dt ON d.documentTypeId = dt.id
      LEFT JOIN document_index_values div ON d.id = div.documentId
      LEFT JOIN document_indices di on di.id =div.documentIndexId
      LEFT JOIN document_conditions dc ON d.documentConditionId = dc.id
      LEFT JOIN departments dpt ON dpt.id = d.departmentId
      LEFT JOIN location_maps lm ON d.locationMapId = lm.id
      LEFT JOIN users u ON d.createdby = u.id
      LEFT JOIN branches b on b.id = d.branchId
      LEFT JOIN favourites f on f.documentId =d.id
      LEFT JOIN tags t on t.docId=d.id
      LEFT JOIN attachments a on a.itemId =d.id
      WHERE
      ${type == "deleted" ? "d.isDeleted = 1" : "d.isDeleted != 1"}

      -- displays favourite document
      ${type == typeOptions.favourite ? "AND f.isfavourite = 1 and  f.ownerId=" + user.id : ""}

      -- displays archived document
      ${type == typeOptions.archived ? "AND d.isArchived = 1 " : "AND d.isArchived != 1 and d.isApproved =1"}
    
      -- exclude documents with statusId 4 if onLoad and isApproved are both true
      ${onLoad ? "AND (d.isApproved != 1 OR d.statusId != 4)" : ""}

      -- Search document according to document type
        ${filterText || ""}

        -- search document according to document index type
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
  subordinateSubQuery(user) +
  `select DISTINCT d.id, d.hasEncryption, d.hasQuickQcr, d.hasOtp, d.createdAt,dt.name DocumentType, d.name OrganizationName, d.otherTitle DocumentName, dpt.name Department, b.name Branch, d.securityLevel, lm.name locationMap,
  case when d.statusId = 1 then 'Active' when d.statusId = 2 then 'checked out' when d.statusId = 3 then 'Suspended' when d.statusId = 4 then 'Dormant' when d.statusId = 5 then 'Closed' else 'Unknown' end DocumentStatus, u.username
  `;
//Dormant Status Added

function querySearchAndFilter(user, offset, limit, filterText, textIndexFilter, onLoad) {
  /**
   * query: get paginated data
   * total: get total document
   */
  return {
    query:
      searchHeaderQuery(user) +
      handleBodyQuery(filterText, textIndexFilter, user, (type = "isDeleted"), "", onLoad) +
      handleBottomQuery(offset, limit),
    total: countQuery(user) + handleBodyQuery(filterText, textIndexFilter, user),
  };
}

/**
 * Execute when visit documnet page.
 */
function queryLoadDocuments(user, offset, limit, isSearchingParameters, onLoad) {
  return {
    query: searchHeaderQuery(user) + handleBodyQuery("", "", user, "", onLoad) + handleBottomQuery(offset, limit),
    total: countQuery(user) + handleBodyQuery("", "", user),
  };
}

/**
 * Execute when visit archived page.
 */
function queryArchivedDocuments(user, offset, limit) {
  const topQuery =
    subordinateSubQuery(user) +
    `
  select DISTINCT d.id,b.name Branch, d.createdAt,dt.name DocumentType,d.returnedByChecker, d.name OrganizationName, d.otherTitle DocumentName, dpt.name Department, d.securityLevel, lm.name locationMap,
  case when d.statusId = 1 then 'Active' when d.statusId = 2 then 'checked out' when d.statusId = 3 then 'Suspended' when d.statusId = 4 then 'Dormant' else 'Unknown' end DocumentStatus, u.username
  `;
  //Dormant Status Added

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
    subordinateSubQuery(user) +
    `
  select DISTINCT d.id, d.createdAt,dt.name DocumentType, b.name Branch,d.name OrganizationName, d.otherTitle DocumentName, dpt.name Department, d.securityLevel, lm.name locationMap, f.isfavourite,
  case when d.statusId = 1 then 'Active' when d.statusId = 2 then 'checked out' when d.statusId = 3 then 'Suspended' when d.statusId = 4 then 'Dormant' else 'Unknown' end DocumentStatus, u.username
  `;
  //Dormant Status Added

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
function queryPendingDocuments(user, offset, limit) {
  const query = `
                      select d.*,
                      (case when d.createdBy=${user.id} then 1 else 0 end) isUserChecker,
                      u.name assignTo ,am.type
                      from documents d
                      join approval_masters am on am.documentId = d.id
                      join approval_queues aq on aq.approvalMasterId = am.id
                      join users u on u.id =am.assignedTo
                      where d.isApproved = 0 and isArchived = 0 and d.isDeleted = 0  and aq.isApprover = 1 and (d.returnedByChecker is null or d.returnedByChecker = 0)
                      and  sendToChecker=1
                      and am.type='document' 
                      and (aq.userId = ${user.id} or d.createdBy =${user.id})
                      UNION ALL
                      -- used for attachment approval
                      SELECT
                      d.*,(case when d.createdBy=${user.id} then 1 else 0 end) isUserChecker,
                      u.name assignTo ,am.type
                      from approval_masters am 
                      join documents d on d.id =am.documentId 
                      join users u on u.id =d.createdBy 
                      where am.type='attachment'
                      and( am.assignedTo = ${user.id} or am.initiatorId =${user.id})
                      and d.isDeleted =0 
                      and am.isActive =1
                      and d.returnedByChecker =0
                      
                      `;

  const pendingCountQuery = `SELECT  COUNT(*) total from (` + query + `) tblCount`;
  return {
    // query: query + handleBottomQuery(offset, limit),
    query: query,
    total: pendingCountQuery,
  };
}
/**
 * Execute when visit Rejected page.
 */
function queryRejectedDocuments(user, offset, limit) {
  const query = `
	select distinct d.* from documents d
join approval_masters am on am.documentId = d.id
join approval_queues aq on aq.approvalMasterId = am.id
where d.isApproved = (case when am.type='attachment'  then 1 else 0 end)
and isArchived = 0  and d.isDeleted = 0 and d.returnedByChecker = 1
and am.isActive =1
and am.initiatorId = ${user.id}`;

  const rejectedCountQuery = `select COUNT(d.id) as total from documents d
join approval_masters am on am.documentId = d.id
join approval_queues aq on aq.approvalMasterId = am.id
where 
d.isApproved = (case when am.type='attachment'  then 1 else 0 end)
and isArchived = 0  
and am.isActive =1
and d.isDeleted = 0 and d.returnedByChecker = 1 and am.initiatorId = ${user.id}`;

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
where d.isApproved = 0 and  d.isDeleted = 0 and isArchived = 0 and (d.sendToChecker = 0 or d.sendToChecker is null) and returnedByChecker !=1 and am.initiatorId = ${user.id}`;

  const savedCountQuery = `select COUNT(d.id) as total from documents d
join approval_masters am on am.documentId = d.id
join approval_queues aq on aq.approvalMasterId = am.id
where d.isApproved = 0 and d.isDeleted = 0 and isArchived = 0 and (d.sendToChecker = 0 or d.sendToChecker is null) and returnedByChecker !=1 and am.initiatorId = ${user.id}`;

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
