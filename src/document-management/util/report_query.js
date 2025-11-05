const branchAndDepartmentQuery = require("../sqlQuery/branchAndDepartmentQuery");

module.exports.documentReportAll = (userId) => {
  const headQuery = `  SELECT 
    YEAR(d.createdAt) AS year, 
    MONTH(d.createdAt) AS month, 
    COUNT(d.id) as count
    FROM documents AS d
    join security_hierarchies sh on sh.code = d.hierarchy
    WHERE d.isApproved = 1 AND d.isDeleted = 0 AND d.isArchived = 0`;

  const endQuery = `GROUP BY YEAR(d.createdAt) , MONTH(d.createdAt)
  ORDER BY year, month ASC`;

  return branchAndDepartmentQuery(userId, headQuery, endQuery, false);
};
