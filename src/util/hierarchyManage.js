const { execSelectQuery } = require("./queryFunction");
const {
  USE_REVERSE_QUERY,
  subordinateQuery,
  bottomHierarchyQuery,
  subordinateSubQuery,
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
  if (typeof user == "number") user = { id: user };

  let use_constant = "";
  let use_multiple_hierarchy = "";
  let use_unit_user = "";
  let use_one_department = "";
  // feature uses or feature only included for these part.
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

  const hierarchyQuery =
    // hierarchy query
    subordinateSubQuery(user, reverse_query) +
    `SELECT ${attributes} FROM ${table} d WHERE
    d.isDeleted = 0 ` +
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
  // console.log(hierarchyQuery);
  // console.log("===============");

  return await execSelectQuery(hierarchyQuery);
};

module.exports = { queryFeatures, availableHierarchy };
