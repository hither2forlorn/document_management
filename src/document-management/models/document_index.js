module.exports = (sequelize, type) => {
  return sequelize.define("document_index", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    dataType: {
      type: type.STRING,
    },
    docId: {
      type: type.INTEGER,
    },

    label: {
      type: type.STRING,
    },

    type: {
      type: type.STRING,
    },

    enum: {
      type: type.STRING,
    },
    apiUrl:{
      type: type.STRING,
    },
    validation: {
      type: type.TEXT,
      defaultValue: null,
    },
    condition: {
      type: type.TEXT,
      defaultValue: null,
    },
    isRequired: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    isShownInAttachment: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
  });
};
