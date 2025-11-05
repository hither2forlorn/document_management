module.exports = (sequelize, type) => {
  return sequelize.define("notification", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: type.TEXT,
    },
    description: {
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
