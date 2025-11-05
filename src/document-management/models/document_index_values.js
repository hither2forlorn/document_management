module.exports = (sequelize, type) => {
  return sequelize.define("document_index_value", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentId: {
      type: type.INTEGER,
    },
    documentIndexId: {
      type: type.INTEGER,
    },
    value: {
      type: type.STRING,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    attachmentId: {
      type: type.INTEGER,
    },
  });
};
