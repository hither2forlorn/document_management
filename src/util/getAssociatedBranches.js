const { execSelectQuery } = require("./queryFunction");

const getAssociatedBranches = async (departmentId) => {
  const query =
    `SELECT b.name, b.id
      FROM branches b
      JOIN security_hierarchies sh ON b.id = sh.branchId
      JOIN department_hierarchy dh ON sh.id = dh.hierarchyId
      WHERE dh.departmentId = ${departmentId}
    `
  try {
    const branches = await execSelectQuery(query);
    return branches;
  } catch (error) {
    console.log(error);
  }
}

module.exports = getAssociatedBranches;