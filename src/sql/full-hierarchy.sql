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
			WHERE id = 2
			)
	
	UNION ALL
	
	SELECT e.id
		,e.code
		,e.parentId
		,s.LEVEL + 1
	FROM security_hierarchies e
	JOIN subordinate s ON e.parentId = s.id
	)
	,subordinate_2
AS (
	SELECT id
		,code
		,parentId
		,0 AS LEVEL
	FROM security_hierarchies
	WHERE code = (
			SELECT hierarchy
			FROM users
			WHERE id = 2
			)
	
	UNION ALL
	
	SELECT e.id
		,e.code
		,e.parentId
		,s.LEVEL + 1
	FROM security_hierarchies e
	JOIN subordinate_2 s ON e.id = s.parentId
	)
SELECT *
FROM location_maps d
WHERE d.isDeleted = 0
	AND (
		-- if user hierarchy falls under below data then preview doc.
		d.hierarchy IN (
			SELECT s.code
			FROM subordinate s
			JOIN security_hierarchies m ON s.parentId  = m.id
			
			UNION ALL 
			
			SELECT s_2.code
			FROM subordinate_2 s_2
			JOIN security_hierarchies m1 ON s_2.id = m1.parentId 
			)
		)
            
            select * from location_maps lm
            select * from users u WHERE id = 2
            SELECT * from security_hierarchies sh            