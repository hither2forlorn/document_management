/**
 * Model containing the metadata of the document
 * @alias Document
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("document", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    isArchived: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    isApproved: {
      type: type.BOOLEAN,
    },
    identifier: {
      type: type.STRING,
    },
    name: {
      type: type.STRING,
    },
    otherTitle: {
      type: type.STRING,
    },
    description: {
      type: type.TEXT,
    },
    disposalDate: {
      type: type.DATE,
    },
    documentTypeId: {
      type: type.INTEGER,
    },
    languageId: {
      type: type.INTEGER,
    },
    documentConditionId: {
      type: type.INTEGER,
    },
    statusId: {
      type: type.INTEGER,
    },
    locationMapId: {
      type: type.INTEGER,
    },
    securityLevel: {
      type: type.INTEGER,
    },
    departmentId: {
      type: type.INTEGER,
      defaultValue: null,
    },
    ownerId: {
      type: type.INTEGER,
    },
    createdBy: {
      type: type.INTEGER,
    },
    editedBy: {
      type: type.INTEGER,
    },
    url: {
      type: type.STRING,
    },
    customer_name: {
      type: type.STRING,
    },
    approved_date: {
      type: type.DATE,
    },
    hasEncryption: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    hasOtp: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    hasQuickQcr: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    CPRno: {
      type: type.STRING,
    },
    hierarchy: {
      type: type.STRING,
    },
    returnedByChecker: {
      type: type.BOOLEAN,
    },
    returnedMessage: {
      type: type.STRING,
    },
    sendToChecker: {
      type: type.BOOLEAN,
    },
    branchId: {
      type: type.INTEGER,
      defaultValue: null,
    },
    userGroupId: {
      type: type.INTEGER,
    },
    cifNumber: {
      type: type.STRING,
    },
  });
};
