module.exports = (sequelize, type) => {
  return sequelize.define("security_hierarchy", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    code: {
      type: type.STRING,
      unique: true,
      allowNull: false,
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
    branchId: {
      type: type.INTEGER,
      defaultValue: null,
      allowNull: true
    },
    parentId: {
      type: type.INTEGER,
      defaultValue: null,
    },
    departmentId: {
      type: type.INTEGER,
    },
    multipleHierarchy: {
      type: type.BOOLEAN,
    },
    type: {
      type: type.STRING,
    },
  });
};
