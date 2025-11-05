module.exports = (sequelize, type) => {
  return sequelize.define("logs", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modelTypeId: {
      type: type.INTEGER,
    },
    operation: {
      type: type.STRING,
    },
    modelValueId: {
      type: type.INTEGER,
    },
    query: {
      type: type.TEXT,
    },
    url: {
      type: type.STRING,
    },
    statusCode: {
      type: type.STRING,
    },
    statusMessage: {
      type: type.STRING,
    },
    ipAddress: {
      type: type.STRING,
    },
    body: {
      type: type.TEXT,
    },
    previousValue: {
      type: type.TEXT,
    },
    diff: {
      type: type.TEXT,
    },
    createdBy: {
      type: type.INTEGER,
    },
    editedBy: {
      type: type.INTEGER,
    },
  });
};
