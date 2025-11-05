module.exports = (sequelize, type) => {
  return sequelize.define("tag", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    label: {
      type: type.STRING,
    },
    value: {
      type: type.STRING,
    },
    attachId: {
      type: type.INTEGER,
    },
    docId: {
      type: type.INTEGER,
    },
    documentTypeId: {
      type: type.INTEGER,
    },
    createdBy: {
      type: type.INTEGER,
    },
    editedBy: {
      type: type.INTEGER,
    },
    branchId: {
      type: type.INTEGER,
    },
    departmentId: {
      type: type.INTEGER,
    },
  });
};
