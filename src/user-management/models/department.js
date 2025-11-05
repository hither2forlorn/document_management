module.exports = (sequelize, type) => {
  return sequelize.define("department", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    level: {
      type: type.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    name: {
      type: type.STRING,
      allowNull: false,
    },
    parentId: {
      type: type.INTEGER,
      defaultValue: null,
    },
    colorCode: {
      type: type.STRING(10),
    },
    hierarchy: {
      type: type.STRING,
    },
    createdBy: {
      type: type.INTEGER,
    },
    editedBy: {
      type: type.INTEGER,
    },
  });
};
