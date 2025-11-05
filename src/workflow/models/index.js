module.exports = (sequelize, Sequelize) => ({
  Workflow: require("./workflow")(sequelize, Sequelize),
  WorkflowUser: require("./workflow_user")(sequelize, Sequelize),
  WorkflowMaster: require("./workflow_master")(sequelize, Sequelize),
  WorkflowLog: require("./workflow_log")(sequelize, Sequelize),
});
