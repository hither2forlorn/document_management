const { execSelectQuery } = require("./queryFunction");
const {
  USE_REVERSE_QUERY,
  subordinateQuery,
  bottomHierarchyQuery,
} = require("../document-management/sqlQuery/hierarchyQuery");
const { queryFeatures } = require("../constants");

/**
 * hierarchy for get all and routes
 *
 * @param {*} userId
 * @param {*} table
 * @param {*} attributes
 * @param {*} searchQuery
 * @param {*} field
 * @returns
 */
const availableHierarchy = async (user, table, attributes, reverse_query, field) => {
  if (typeof user === "number") user = { id: user };

  let use_constant = "";
  let use_multiple_hierarchy = "";
  let use_unit_user = "";
  let use_one_department = "";

  // Feature-specific query logic
  switch (table) {
    case "roles":
      use_constant = queryFeatures.CONSTANT;
      break;
    case "location_maps":
      use_constant = queryFeatures.CONSTANT;
      use_multiple_hierarchy = queryFeatures.MULTIPLE_HIERARCHIES;
      break;
    case "users":
      use_unit_user = queryFeatures.UNIT_USER;
      break;
    case "departments":
      use_one_department = queryFeatures.USE_SHOW_USER_DEPT;
      break;
  }

  // Adjust query construction for "departments" to include joins
  let baseQuery;
  if (table === "departments") {
    baseQuery = `
      SELECT ${attributes}
      FROM department_hierarchy dh
      INNER JOIN departments d ON dh.departmentId = d.id
      INNER JOIN security_hierarchies sh ON dh.hierarchyId = sh.id
      WHERE d.isDeleted = 0 AND sh.isDeleted = 0
    `;
  } else {
    baseQuery = `
      SELECT ${attributes}
      FROM ${table} d
      WHERE d.isDeleted = 0
    `;
  }

  // Combine with subordinate and bottom hierarchy queries
  const hierarchyQuery =
    subordinateQuery(user, reverse_query) +
    baseQuery +
    reverse_query +
    bottomHierarchyQuery(
      user,
      reverse_query,
      field,
      "",
      use_constant,
      use_multiple_hierarchy,
      use_unit_user,
      use_one_department
    );

  return await execSelectQuery(hierarchyQuery);
};

module.exports = { queryFeatures, availableHierarchy };
