module.exports = (sequelize, type) => {
  return sequelize.define("workflow_user", {
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
    level: {
      type: type.INTEGER,
      allowNull: false,
    },
    userId: {
      type: type.INTEGER,
    },
    type: {
      type: type.STRING(25),
      // recommender, approver
    },
  });
};
