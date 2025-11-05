module.exports = (sequelize, type) => {
  return sequelize.define("workflow", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    name: {
      type: type.STRING,
    },
  });
};
