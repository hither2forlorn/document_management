const branchAndDepartmentQuery = require("../../document-management/sqlQuery/branchAndDepartmentQuery");

const adminQuery = (userId, query) => {
  return userId == 1 ? "" : query;
};

module.exports.deleteLogReport = (userId) => {
  const result = ` 
    SELECT mt.name itemType , count(l.id) as count
    from logs l
    join model_types mt on mt.id =l.modelTypeId 
    join users us on us.id =l.createdBy   
    where operation ='DELETE' 
    ${adminQuery(
      userId,
      `and 
      (
        case when
        -- column hierarchy 
        (case when  us.departmentId  is not null then us.departmentId when  us.branchId is not null then us.branchId  else  null end) -- [priority]departmentId or branchId
        =
        (select (case when u.departmentId is not null then u.departmentId else u.branchId end )  from users u WHERE id=${userId}) -- get branch or dept id from user id

        THEN 1
        ELSE 0 END) =1
        `
    )} GROUP BY mt.name`;

  return result;
};

module.exports.documentTypeReport = (userId) => {
  const headQuery = `
  Select dt.name name, COUNT(dt.id) count from document_types dt 
  JOIN security_hierarchies sh on sh.code =dt.hierarchy
  WHERE dt.isDeleted=0`;

  const endQuery = "GROUP BY dt.name";

  // console.log(branchAndDepartmentQuery(userId, headQuery, endQuery));
  return branchAndDepartmentQuery(userId, headQuery, endQuery);
};
