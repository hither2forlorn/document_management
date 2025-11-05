-- Find all document uloaded by user with  branch if he/she has multiple branchs.
select DISTINCT  u.id , u.name, b.name branchName,
COUNT(d.id) total,
COUNT(case when d.isApproved =1 then 1 end) Approved,
COUNT(case when d.isApproved =0 then 1 end) Pending
from documents d
join users u on u.id = d.createdBy  
join branches b on b.id =d.branchId 
WHERE
d.isDeleted =0 
--and d.createdAt >= #from and d.createdAt <= #to
GROUP by u.name,u.id ,b.name  
ORDER by total DESC 



-- total document uploaded by branch can be filter by week	 
select wd.branchCode ,branchName, totalDocuments, wd.Approved, wd.Pending
from (
	select DISTINCT  b.id branchId, b.branchCode ,b.name branchName,
	count(d.id) totalDocuments,
	COUNT(case when d.isApproved =1 then 1 end) Approved,
	COUNT(case when d.isApproved =0 then 1 end) Pending
	from documents d
	join branches b on b.id = d.branchId 
	WHERE d.createdAt >= #from and d.createdAt <= #to
	group by b.id,b.name,b.branchCode
) wd	
join branches branch on wd.branchId = branch.id
group by wd.branchCode ,branchName, totalDocuments, wd.Approved, wd.Pending




-- documents information
select d.identifier, d.otherTitle, d.name, d.isDeleted ,d.isApproved, dept.name department,b.name branch, am.createdAt ,(case when d.isApproved = 1 then am.updatedAt else null end ) approvedDate
from documents d 
join users u on d.createdBy  = u.id
left join branches b on b.id =d.branchId 
left join departments dept on dept.id= d.departmentId 
join approval_masters am on am.documentId =d.id 
where d.isApproved =1 and d.createdAt >= #from and d.createdAt <= #to

-- documents information of deleted  files
select d.identifier, d.otherTitle, d.name, d.isDeleted ,d.isApproved, dept.name department,b.name branch, am.createdAt ,(case when d.isApproved = 1 then am.updatedAt else null end ) approvedDate
from documents d 
join users u on d.createdBy  = u.id
left join branches b on b.id =d.branchId 
left join departments dept on dept.id= d.departmentId 
join approval_masters am on am.documentId =d.id 
where d.isApproved =1
and d.isDeleted =1

	
-- interbranch,docs document transfer (Through Ownership Transfer)
select d.id,d.identifier,u.name,d.securityLevel,d.isApproved ,d.isArchived,d.isDeleted   from	
(SELECT dau.documentId,COUNT(dau.documentId) doc_total
from document_access_users dau 
group by dau.documentId ) high
JOIN documents d on d.id =high.documentId
join document_access_users dau2 on dau2.documentId = d.id
join users u on u.id =dau2.userId 
where doc_total=1 and d.createdAt >= #from and d.createdAt <= #to



-- list document with number of attachments
select d.id,d.name ,d.otherTitle ,d.description,approved_date ,isApproved ,securityLevel ,departmentId ,branchId  , count(a.id) TotalAttachment
from documents d
left join attachments a on d.id = a.itemId 
and d.createdAt >= #from and d.createdAt <= #to
group by d.id,d.name ,d.otherTitle ,d.description,approved_date ,isApproved ,securityLevel ,departmentId ,branchId 


-- document audits
SELECT * from document_audits da where documentId = #id