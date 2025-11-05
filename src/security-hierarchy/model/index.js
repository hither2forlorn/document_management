module.exports = (sequelize, Sequelize) => ({
  SecurityHierarchy: require("./security_hierarchy")(sequelize, Sequelize),
  DepartmentHierarchy: require("./department_hierarchy")(sequelize, Sequelize),
});
