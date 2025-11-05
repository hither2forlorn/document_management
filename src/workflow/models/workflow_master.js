module.exports = (sequelize, type) => {
  return sequelize.define("workflow_master", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workflowId: {
      type: type.INTEGER,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    isCompleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    requestId: {
      type: type.STRING,
    },
    initiatorId: {
      type: type.INTEGER,
    },
    currentStatus: {
      type: type.STRING,
    },
    currentLevel: {
      defaultValue: 0,
      type: type.INTEGER,
    },
    maxLevel: {
      defaultValue: 0,
      type: type.INTEGER,
    },
    assignedTo: {
      type: type.INTEGER,
    },
    assignedOn: {
      type: type.DATE,
    },
  });
};
