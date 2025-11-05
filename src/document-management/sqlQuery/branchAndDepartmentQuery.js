const isSuperAdmin = require("./isSuperAdmin");

/**
 *
 * Seperate branch and department
 * @param userId
 * @param head query for select
 * @param end group or join
 * @returns full query
 */
function branchAndDepartmentQuery(userId, head, end = "", allBranchCanVIew = true, hierarchy = "") {
  const body = `${
    isSuperAdmin({ id: userId, hierarchy })
      ? ""
      : `
        and
        (
        case when
        -- column hierarchy 
        (case when  sh.type = 'department' then sh.departmentId when  sh.type ='branch' then sh.branchId  else  null end) -- [priority]departmentId or branchId
        =
        (select (case when u.departmentId is not null then u.departmentId else u.branchId end )  from users u WHERE id=${userId}) -- get branch or dept id from user id
       
        -- filter only if branch or department 
        and sh.type =(select (case when u.departmentId is null then 'branch' else 'department' end )  from users u WHERE id=${userId})
        
        THEN 1
        ELSE 0 END) =1

        --constant
        or sh.code='CONSTANT'      
${
  allBranchCanVIew
    ? ` or
  (
  case when  sh.type = (select (case when u.departmentId is null then 'branch' end )  from users u WHERE id=${userId})
  then 1 else 0 end  
  )=1`
    : ""
}
       
 
    `
  }`;

  return head + body + end;
}
module.exports = branchAndDepartmentQuery;
