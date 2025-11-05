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
    madeBy: {
      type: type.STRING,
    },
    checkedBy: {
      type: type.STRING,
    },
    verifyBy: {
      type: type.STRING,
    },
    description: {
      type: type.TEXT,
    },
    commentByChecker:{
      type: type.STRING,
    },
    disposalDate: {
      type: type.DATE,
    },
    disposalDateNP: {
      type: type.DATE,
    },
    // rejectionDateByApprover
    rejectionDateOfApprover: {
      type: type.DATE,
    },
    // rejectionDateByChecker
    rejectionDateOfChecker: {
      type: type.DATE,
    },
     // checkedAt
     checkedAt: {
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
    rejectionMessageByChecker: {
      type: type.STRING,
    },
    //to add rejection message of checker
    rejectionMessageByApprover: {
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
    notification: {
      type: type.INTEGER,
    },
    notificationUnit: {
      type: type.STRING,
      validate: {
        isIn: [["hr", "day", "week"]],
      },
    },
    returnedByApprover:{
      type: type.BOOLEAN,
    },
    sendToApprover:{
      type: type.BOOLEAN,
    }
  });
};
