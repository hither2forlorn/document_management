module.exports = (sequelize, type) => {
  return sequelize.define("workflow_log", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workflowMasterId: {
      type: type.INTEGER,
    },
    action: {
      type: type.STRING,
    },
    comment: {
      type: type.TEXT,
    },
    userId: {
      type: type.INTEGER,
    },
    assignedOn: {
      type: type.DATE,
    },
  });
};
