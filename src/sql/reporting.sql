	
-- Number of document by user

select u.id, u.name,COUNT(d.ownerId)total,b.name  from documents d
join users u on u.id = d.ownerId 
join branches b on b.id = u.branchId 
WHERE d.createdAt >= #from and d.createdAt <= #to
GROUP by d.ownerId ,u.name,u.id ,b.name 
ORDER by total DESC 

select branchId,branchName, totalDocuments from ( 	select b.id branchId,b.name branchName, count(b.id) totalDocuments 	from documents d 	join users u on u.id =d.ownerId 	join branches b on b.id = u.branchId 	LEFT JOIN document_index_values div ON d.id = div.documentId 	LEFT JOIN document_indices di on di.id =div.documentIndexId  	LEFT JOIN document_conditions dc ON d.documentConditionId = dc.id  	LEFT JOIN departments dpt ON d.departmentId = dpt.id  	LEFT JOIN location_maps lm ON d.locationMapId = lm.id 	WHERE d.createdAt >= #from and d.createdAt <= #to 	group by b.id,b.name ) as weeklyDoc join branches branch on weeklyDoc.branchId = branch.id

-- total document uploaded by branch can be filter by week	 
select weeklyDoc.branchCode ,branchName, totalDocuments
from (
	select b.id branchId, b.branchCode ,b.name branchName, count(b.id) totalDocuments
	from documents d
	join users u on u.id =d.ownerId
	join branches b on b.id = u.branchId

	WHERE d.createdAt >= #from and d.createdAt <= #to
	group by b.id,b.name,b.branchCode
) weeklyDoc
join branches branch on weeklyDoc.branchId = branch.id

-- checker
SELECT u.name,
count(d.id) AS total,
approved.approved,
rejected.rejected,
(count(d.id) - approved - rejected) as pending
FROM documents d
JOIN approval_masters am ON am.documentId = d.id
JOIN users u ON u.id = am.assignedTo
FULL JOIN (
SELECT u.name,
u.id id,
count(d.id) AS approved
FROM documents d
JOIN approval_masters am ON am.documentId = d.id
JOIN users u ON u.id = am.assignedTo
WHERE d.isApproved = 1
GROUP BY u.name, u.id
) AS approved ON approved.id = u.id
FULL JOIN (
select distinct u.name, u.id as uid, count(d.id) as rejected from documents d
join approval_masters am on am.documentId = d.id
join users u on u.id = am.assignedTo
join document_audits da on da.documentId = d.id
where d.isApproved = 0 and da.accessType = 'decline' and  d.createdAt >= #from and d.createdAt <= #to
group by u.name, u.id, da.id) as rejected on rejected.uid = u.id
GROUP BY u.name,approved.approved, rejected.rejected



-- maker
SELECT u.name, COUNT(d.id) AS total, approved.approved, rejected.rejected, COUNT(d.id) - approved.approved - rejected.rejected AS pending
FROM     documents AS d INNER JOIN
                  approval_masters AS am ON am.documentId = d.id INNER JOIN
                  users AS u ON u.id = am.initiatorId FULL OUTER JOIN
                      (SELECT u.name, u.id, COUNT(d.id) AS approved
                       FROM      documents AS d INNER JOIN
                                         approval_masters AS am ON am.documentId = d.id INNER JOIN
                                         users AS u ON u.id = am.initiatorId
                       WHERE   (d.isApproved = 1)
                       GROUP BY u.name, u.id) AS approved ON approved.id = u.id FULL OUTER JOIN
                      (SELECT DISTINCT u.name, u.id AS uid, COUNT(d.id) AS rejected
                       FROM      documents AS d INNER JOIN
                                         approval_masters AS am ON am.documentId = d.id INNER JOIN
                                         users AS u ON u.id = am.initiatorId INNER JOIN
                                         document_audits AS da ON da.documentId = d.id
                       WHERE   (d.isApproved = 0) AND (da.accessType = 'decline') and  d.createdAt >= #from and d.createdAt <= #to
                       GROUP BY u.name, u.id, da.id) AS rejected ON rejected.uid = u.id
GROUP BY u.name, approved.approved, rejected.rejected