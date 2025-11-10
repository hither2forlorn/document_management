



-- hierarchy subordinate
WITH subordinate
AS (
	SELECT id
		,code
		,parentId
		,0 AS LEVEL
	FROM security_hierarchies
	WHERE code = (
			SELECT hierarchy
			FROM users
			WHERE id = 97
			)
	
	UNION ALL
	
	SELECT e.id
		,e.code
		,e.parentId
		,s.LEVEL + 1
	FROM security_hierarchies e
	JOIN subordinate s ON e.parentId = s.id
	)

	-- unit subordinate
	-- get unit hierarchy
	,subordinate_unit
AS (
	SELECT id
		,code
		,departmentId
		,0 AS LEVEL
	FROM security_hierarchies
	WHERE code = (
			SELECT hierarchy
			FROM users
			WHERE id = 97
			)
	
	UNION ALL
	
	SELECT e.id
		,e.code
		,e.departmentId
		,s.LEVEL + 1
	FROM security_hierarchies e
	JOIN subordinate_unit s ON e.departmentId = s.id
	)
SELECT DISTINCT d.id
	,d.hierarchy
	,d.hasEncryption
	,d.hasQuickQcr
	,d.hasOtp
	,d.createdAt
	,dt.name DocumentType
	,d.name OrganizationName
	,d.otherTitle DocumentName
	,dpt.name Department
	,d.securityLevel
	,lm.name locationMap
	,CASE 
		WHEN d.statusId = 1
			THEN 'Active'
		WHEN d.statusId = 2
			THEN 'checked out'
		WHEN d.statusId = 3
			THEN 'Suspended'
		WHEN d.statusId = 4
			THEN 'Dormant'
		WHEN d.statusId = 5
			THEN 'Closed'
		ELSE 'Unknown'
		END DocumentStatus
	,u.username
FROM documents d
JOIN document_types dt ON d.documentTypeId = dt.id
LEFT JOIN document_index_values div ON d.id = div.documentId
LEFT JOIN document_indices di ON di.id = div.documentIndexId
LEFT JOIN document_conditions dc ON d.documentConditionId = dc.id
LEFT JOIN departments dpt ON d.departmentId = dpt.id
LEFT JOIN location_maps lm ON d.locationMapId = lm.id
LEFT JOIN users u ON d.createdby = u.id
LEFT JOIN favourites f ON f.documentId = d.id
LEFT JOIN tags t ON t.docId = d.id
LEFT JOIN attachments a ON a.itemId = d.id
left join security_hierarchies sh on sh.code = d.hierarchy
WHERE d.isDeleted != 1
	-- displays favourite document
	-- displays archived document
	AND d.isArchived != 1
	AND d.isApproved = 1
	AND (
		CASE 
			WHEN convert(VARCHAR, securityLevel) IS NULL
				AND (
					-- if user hierarchy falls under below data then preview doc.
					d.hierarchy IN (
					case when sh.departmentId is null then (
											SELECT s.code
											FROM subordinate s
											JOIN security_hierarchies m ON s.parentId = m.id
					)
					else (


						SELECT s.code
						FROM subordinate s
						JOIN security_hierarchies m ON s.parentId = m.id
						

						-- if sh.departmentId true  
						UNION ALL	
						
						SELECT s.code
						FROM subordinate_unit s
						JOIN security_hierarchies m ON s.departmentId = m.id
						)
						end



						)
					)
				THEN 1
			

			END
		) = 1

ORDER BY d.createdAt DESC OFFSET 0 ROWS

FETCH NEXT 10 ROWS ONLY

select * from security_hierarchies
select * from documents
                                                                                                        