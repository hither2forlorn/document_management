

-- Find Duplicate document
SELECT
    d.otherTitle ,d.name, COUNT(d.id)
FROM
    documents d   
   -- join attachments a on a.itemId =d.id
    where d.createdAt >= '2022-09-06' and d.isDeleted =0
GROUP BY
    d.otherTitle ,d.name
HAVING 
    COUNT(*) > 1
    
    
-- total number of document
 select COUNT(*)  from documents d
 where d.branchId =9 and d.isDeleted =0
 
 -- Document with number of attachment
 (select DISTINCT (select count(*) from attachments attach WHERE attach.itemId=d.id) attachment ,d.*
 from documents d 
 join attachments a on a.itemId =d.id
 where d.branchId =9 and d.isDeleted =0)
 
 
-- Total  number of  attachment
 select  SUM(attachment)  total
 from
(select DISTINCT (select count(*) from attachments attach WHERE attach.itemId=d.id) attachment ,d.*
 from documents d 
 join attachments a on a.itemId =d.id
 where d.branchId =9 and d.isDeleted =0) temp
 
 --document with no attachment
 select  *
 from
(select DISTINCT (select count(*) from attachments attach WHERE attach.itemId=d.id) attachment ,d.*
 from documents d 
 join attachments a on a.itemId =d.id
 where d.branchId =9 and d.isDeleted =0) temp
 where attachment=0
 