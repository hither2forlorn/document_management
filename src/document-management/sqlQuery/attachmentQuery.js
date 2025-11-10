const { consoleLog } = require("../../util");
const { subordinateQuery, bottomHierarchyQuery, subordinateSubQuery } = require("./hierarchyQuery");

const countTopQuery = `SELECT COUNT(DISTINCT a.id) as total`;

const topQuery = `select DISTINCT a.*, a.createdAt, d.name as documentName,a.attachmentDescription as description, d.otherTitle,dt.name as documentType ,dpt.name as department,bra.name as branch`;

const searchHeaderQuery = (user) => subordinateSubQuery(user) + topQuery;
// counts number of document
const countQuery = (user) => {
  return subordinateSubQuery(user) + countTopQuery;
};

/**
 * To handle pagination
 */
const handleBottomQuery = (offset, limit) => `
ORDER BY a.createdAt desc OFFSET ${offset} ROWS
FETCH NEXT ${limit} ROWS ONLY
  `;

const handleBodyQuery = (filterText, textIndexFilter, user) => {
  return `
  FROM attachments a
  join documents d ON d.id =a.itemId
 join document_types dt ON dt.id =a.documentTypeId
 left JOIN document_indices di ON di.docid = dt.id
 left JOIN document_index_values div ON di.id = div.documentIndexId
 and div.attachmentId = a.id
 left JOIN departments dpt ON dpt.id = d.departmentId
 left JOIN branches bra ON bra.id = d.branchId
 left JOIN location_maps lm on lm.id=d.locationMapId
 left join tags t on t.docId=d.id
 
 where a.isDeleted!=1
 and d.isDeleted!=1
 and d.isArchived != 1
 and d.isApproved =1
 
 -- Search document according to document type, department and others.
 ${filterText || ""}
 
 -- search document according to document index type --only for index type search
 ${textIndexFilter || ""}
 
 ${bottomHierarchyQuery(user, "dont_reverse", "", "document")}
 

`;
};

/**
 * Only execute when there is search data
 */
function querySearchAndFilter(user, offset, limit, filterText, textIndexFilter) {
  return {
    query: searchHeaderQuery(user) + handleBodyQuery(filterText, textIndexFilter, user) + handleBottomQuery(offset, limit),
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

// single document for edit
function singleAttachment(id) {
  return {
    query: `

    select a.notes, di.id id,di.label,div.id documentIndexValueId ,d.id documentId,di.id documentIndexId, div.value,div.isDeleted,a.id attachmentId,  dt.id documentTypeId,div.createdAt ,div.updatedAt
    from attachments a
    left join document_index_values div on div.attachmentId =a.id
    left join document_indices di on di.id =div.documentIndexId
    join documents d ON d.id =a.itemId
    join document_types dt ON dt.id =a.documentTypeId

    where a.id=${id}

    and a.isDeleted!=1
    and d.isDeleted!=1
    -- AND d.isArchived != 1
  `,
  };
}

module.exports = { singleAttachment, querySearchAndFilter, queryLoadDocuments };
