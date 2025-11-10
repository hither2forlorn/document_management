function excelData(documentNames) {
  // Create placeholders for the documentNames
  const placeholders = documentNames.map(() => "?").join(", ");

  const query = `
        SELECT DISTINCT  d.otherTitle AS DocumentName, dt.name AS DocumentType, 
         b.name AS Branch, 
        CASE 
          WHEN d.statusId = 1 THEN 'Active' 
          WHEN d.statusId = 2 THEN 'checked out' 
          WHEN d.statusId = 3 THEN 'Suspended' 
          WHEN d.statusId = 4 THEN 'Dormant' 
          WHEN d.statusId = 5 THEN 'Closed' 
          ELSE 'Unknown' 
        END AS DocumentStatus, 
        u.username AS CreatedBy,
        d.createdAt AS DateCreated
        FROM documents d
        JOIN document_types dt ON d.documentTypeId = dt.id
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
        WHERE d.isDeleted != 1
        AND d.isArchived != 1 AND d.isApproved = 1
        AND d.name IN (${placeholders})`;

  return {
    query,
    values: documentNames,
  };
}

module.exports = {
  excelData,
};
