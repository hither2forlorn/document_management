const isSuperAdmin = require("./isSuperAdmin");

// query for document view in attachmenttable component
function documentAttachment(docId, user) {
  const query = `
  select a.*,label,value,div.id indexValueId,di.dataType,di.isShownInAttachment,dt.name as documentType ,dt.parentId
  FROM attachments a
  left join document_index_values div ON div.attachmentId =a.id
  left join document_indices di ON div.documentIndexId =di.id
  left join document_types dt on dt.id=a.documentTypeId
  left join constants const on const.id =div.value 
 `;

  const attachments = `where a.itemId=${docId}
   ${
     isSuperAdmin(user)
       ? " "
       : `and a.isDeleted != 1 
   `
   }
 `;
  return docId ? query + attachments : query;
}

function associatedAttachmentQuery(id) {
  return (query = `
  SELECT DISTINCT a.*
    ,di.label
    ,div.value
    ,div.id indexValueId
    ,di.dataType
    ,di.isShownInAttachment
    ,dt.name AS documentType
    ,dt.parentId
  FROM attachments a
  JOIN tags t ON t.attachId = a.id
  LEFT JOIN document_index_values div ON div.attachmentId = a.id
  LEFT JOIN document_indices di ON div.documentIndexId = di.id
  JOIN document_types dt ON dt.id = a.documentTypeId
  WHERE t.docId = ${id}`);
}

/**
 * get data from tags
 * @param {*} id
 * @param {*} column column name of tag
 * @returns
 */
function associatedBokIdFromTags(id, column) {
  const query = `select * from tags t where ${column} =${id} `;
  return query;
}

function docTagSearch(id, column) {
  const query = `select * from tags t where ${column} = ${id} and label = 'tag' `;
  return query;
}

module.exports = {
  documentAttachment,
  associatedBokIdFromTags,
  docTagSearch,
  associatedAttachmentQuery,
};
