const { consoleLog } = require("../../util");
const { subordinateQuery, bottomHierarchyQuery } = require("./hierarchyQuery");

const countTopQuery = `SELECT COUNT(DISTINCT a.id) as total`;

const topQuery = `select DISTINCT a.*, a.createdAt, d.name as documentName,a.attachmentDescription as description, d.otherTitle,dt.name as documentType ,dpt.name as department,dpt.id as departmentId,bra.name as branch`;

const searchHeaderQuery = (user) =>
  subordinateQuery(user) +
  topQuery
  ;


// counts number of document
const countQuery = (user) => {
  return subordinateQuery(user) + countTopQuery;
};


/**
 * To handle pagination
 */
const handleBottomQuery = (offset, limit) => (`
ORDER BY a.createdAt desc OFFSET ${offset} ROWS
FETCH NEXT ${limit} ROWS ONLY
  `);

const handleBodyQuery = (filterText, textIndexFilter, user) => {
  return `
    FROM attachments a
    JOIN documents d ON d.id = a.itemId
    JOIN document_types dt ON dt.id = d.documentTypeId
    LEFT JOIN departments dpt ON dpt.id = d.departmentId
    LEFT JOIN branches bra ON bra.id = d.branchId
    LEFT JOIN location_maps lm ON lm.id = d.locationMapId
    LEFT JOIN users u ON d.createdby = u.id
  
    WHERE a.isDeleted != 1
    AND d.isDeleted != 1
    AND d.isArchived != 1
    AND d.isApproved = 1
  
    ${user.roleId !== 1 && user.hierarchy !== "Super-002" ?
      (user.hierarchy.includes("Super") ? `
        AND d.hierarchy IN (
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
        )
      ` :
        ``)
      : ""
    }
  
    ${filterText || ""}
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
function queryLoadDocuments(user, offset, limit) {
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
