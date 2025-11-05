/**
 * Model for the index of Document
 * @alias DocumentType
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("document_type", {
    id: {
      type: type.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    name: {
      type: type.STRING,
    },
    level: {
      type: type.INTEGER,
      defaultValue: 0,
    },
    isAssociatedIDReq: {
      type: type.BOOLEAN,
    },
    parentId: {
      type: type.INTEGER,
    },
    active: {
      type: type.BOOLEAN,
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
    uploadOptional: {
      type: type.BOOLEAN,
    },
  });
};
