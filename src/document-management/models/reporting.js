module.exports = (sequelize, type) => {
  return sequelize.define("reporting", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.STRING,
      defaultValue: false,
    },
    query: {
      type: type.STRING,
    },
    name: {
      type: type.STRING,
    },
    desc: {
      type: type.TEXT,
    },
  });
};
