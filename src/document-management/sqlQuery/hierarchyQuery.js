const { banks, excludeThisVendor } = require("../../config/selectVendor");
const USE_REVERSE_QUERY = "USE_REVERSE_QUERY";
const { queryFeatures } = require("../../constants");
const isSuperAdmin = require("./isSuperAdmin");

// creates subordinate table
function subordinateQuery(user, reverse) {
  // donot add this hierarchy in bok
  return excludeThisVendor(banks.bok.name)
    ? `WITH subordinate AS (
          SELECT  id,
                  code,
                  parentId,
                  0 AS level
          FROM security_hierarchies
          WHERE code = ( select hierarchy from users where id = ${user.id})
  
          UNION ALL
  
          SELECT  e.id,
                  e.code,
                  e.parentId,
                  s.level + 1
          FROM security_hierarchies e
          JOIN subordinate s
          ${reverse == queryFeatures.USE_REVERSE_QUERY ? "ON e.id = s.parentId" : "ON e.parentId = s.id"}

        )
        ,
                subordinate_unit
                AS (
                  SELECT id
                    ,code
                    ,departmentId
                    ,0 AS LEVEL
                  FROM security_hierarchies
                  WHERE code = (
                      SELECT hierarchy
                      FROM users
                      WHERE id =  ${user.id}
                      )
                  
                  UNION ALL
                  
                  SELECT e.id
                    ,e.code
                    ,e.departmentId
                    ,s.LEVEL + 1
                  FROM security_hierarchies e
                  JOIN subordinate_unit s ON e.departmentId = s.id
                  and e.type='unit'
                  )
        
        `
    : "";
}
/**
 * Bootton query for subordinate query
 * Runs only when subordinateQuery is executed.
 * @param {*} user
 * @returns
 */
function bottomHierarchyQuery(
  user,
  reverse = queryFeatures.USE_REVERSE_QUERY,
  field,
  documentQuery,
  CONSTANT,
  use_multiple_hierarchy,
  use_unit_user,
  showOneDepartment
) {
  //  Empty string For admin and subordinate function is empty
  return subordinateSubQuery(user) == "" || isSuperAdmin(user)
    ? ""
    : `
          -- display doc if it's in the hierarchy
          
          ${
            documentQuery == "document"
              ? `AND  (
              CASE WHEN convert(varchar, securityLevel) IS NULL `
              : ""
          }  
            and (
              -- if user hierarchy falls under below data then preview doc.
              d.${field || "hierarchy"} IN (
                SELECT s.code 
                FROM RecursiveSubordinate s 
                JOIN security_hierarchies m ON s.parentId = m.id

                UNION ALL	
                SELECT s.code
                FROM RecursiveSubordinateUnit s
                JOIN security_hierarchies m ON s.departmentId = m.id  

                ${
                  use_unit_user == queryFeatures.UNIT_USER
                    ? `UNION ALL
                              
                SELECT sh.code 
                from security_hierarchies sh 
                where id=(
                SELECT parentId  
                from security_hierarchies s 
                where code ='${user.hierarchy}'
                and type='unit'
                )
                  `
                    : ""
                }
  
                  ${
                    // For Reverse Hierarchy -- not used in appl
                    reverse == queryFeatures.USE_REVERSE_QUERY
                      ? `--reverse hierary used
                      WHERE s.level <= (SELECT s.level FROM subordinate s WHERE s.code = d.hierarchy)`
                      : ""
                  }
              )

              ${
                use_multiple_hierarchy == "MULTIPLE_HIERARCHIES"
                  ? `	or 
              (SELECT hierarchy
              FROM users
              WHERE id = ${user.id}) in(
                SELECT cast(mh.hierarchy as varchar) code            
                        FROM multiple_hierarchies mh WHERE 
                        (case when d.multipleHierarchy is not null and d.id = mh.modelValueId  then 1 else 0 end) = 1
              
              )`
                  : ""
              }
              ${
                // constant - show all hierarchy
                CONSTANT == queryFeatures.CONSTANT ? "or d.hierarchy ='CONSTANT'" : ""
              }

              ${
                /// Also show current user department
                showOneDepartment === queryFeatures.USE_SHOW_USER_DEPT ? `or d.id=${user.departmentId || "''"}` : ""
              }
            ${
              // Security level
              documentQuery == "document" ? securityLevelQuery(user) : ")"
            }  
            
         
               

`;
}

/**
 * RBB - use hierarchy when needed
 * @param {*} user
 * @returns
 */
// function securityLevelQuery(user) {
//   return `
//   ) Then 1 ELSE
//   (
//               CASE WHEN (d.securityLevel = 1) THEN 1 WHEN (d.securityLevel = 2)
//               AND (
//                 ${user.id} IN (
//                   ${user.departmentId
//       ? `SELECT
//                     id
//                     FROM
//                     users usr
//                     WHERE
//                     usr.departmentId = dpt.id and d.hierarchy=(SELECT hierarchy from users WHERE id =${user.id} )
//                     `
//       : `
//                   SELECT id
//                   FROM users
//                   WHERE branchId  = d.branchId
//                     `
//     }
//                 )
//               ) THEN 1
//               WHEN (d.securityLevel = 3)
//               AND (
//                 ${user.id} IN (
//                   SELECT
//                     id
//                   FROM
//                     users
//                   WHERE
//                     id IN (
//                       SELECT
//                         userid
//                       FROM
//                         document_access_users dac
//                       WHERE
//                         dac.documentId = d.id
//                     )
//                 )
//                 ) Then 1
//                 		WHEN (d.securityLevel = 4)
// 							AND (
// 								  ${user.id} IN (
// 									SELECT id
// 									FROM users
// 									WHERE id IN (
//                     SELECT usr.id from users usr
//                     join user_groups ug on ug.id =usr.userGroupId
//                     where
//                     (case when (usr.userGroupId is not null and usr.userGroupId =d.userGroupId and usr.userGroupId=1 ) and (usr.branchId = d.branchId or usr.departmentId =d.departmentId) then 1
//                     when (usr.userGroupId is not null and usr.userGroupId =  d.userGroupId and usr.userGroupId=2) then  1
//                     else 0 end)=1
//                     )
//                     )
// 								)
// 							THEN 1
//                 ELSE 0 END) END)=1`;
// }

function securityLevelQuery(user) {
  return `
  ) Then 1 ELSE
  (
      CASE 
          WHEN (d.securityLevel = 1) THEN 1 
          WHEN (d.securityLevel = 2) AND (
              ${user.id} IN (
                  ${
                    user.departmentId
                      ? `SELECT 
                            id 
                          FROM 
                            users usr
                          WHERE 
                            usr.departmentId = dpt.id and d.hierarchy=(SELECT hierarchy from users WHERE id =${user.id} )
                        `
                      : `
                          SELECT id
                          FROM users
                          WHERE branchId  = d.branchId
                        `
                  }
              )
          ) THEN 1
          WHEN (d.securityLevel = 3) AND (
              ${user.id} IN (
                  SELECT 
                      id 
                  FROM 
                      users 
                  WHERE 
                      id IN (
                          SELECT 
                              userid 
                          FROM 
                              document_access_users dac 
                          WHERE 
                              dac.documentId = d.id
                      )
              )
          ) THEN 1
          
      END
  ) END)=1`;
}

function subordinateSubQuery(user) {
  return `WITH RecursiveSubordinate AS (
    SELECT id, code, parentId, 0 AS level
    FROM security_hierarchies
    WHERE code = (SELECT hierarchy FROM users WHERE id = ${user.id})
    UNION ALL
    SELECT e.id, e.code, e.parentId, s.level + 1
    FROM security_hierarchies e
    JOIN RecursiveSubordinate s ON e.parentId = s.id
),
RecursiveSubordinateUnit AS (
    SELECT id, code, departmentId, 0 AS level
    FROM security_hierarchies
    WHERE code = (SELECT hierarchy FROM users WHERE id = ${user.id})
    UNION ALL
    SELECT e.id, e.code, e.departmentId, s.level + 1
    FROM security_hierarchies e
    JOIN RecursiveSubordinateUnit s ON e.departmentId = s.id
    WHERE e.type = 'unit'
)`;
}

module.exports = {
  USE_REVERSE_QUERY,
  subordinateQuery,
  securityLevelQuery,
  bottomHierarchyQuery,
  subordinateSubQuery,
};
