module.exports = (sequelize, Sequelize) => ({
  SecurityHierarchy: require("./security_hierarchy")(sequelize, Sequelize),
});
