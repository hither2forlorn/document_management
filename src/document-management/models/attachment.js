/**
 * Model to store the metadata of the attachments
 * @alias Attachment
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("attachment", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    isCompressed: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    isEncrypted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    itemType: {
      type: type.STRING,
      defaultValue: "document",
    },
    itemId: {
      type: type.INTEGER,
    },
    name: {
      type: type.STRING,
    },
    redaction: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    ocr: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    attachmentDescription: {
      type: type.TEXT,
    },
    fileType: {
      type: type.STRING,
    },
    size: {
      type: type.STRING,
    },
    filePath: {
      type: type.STRING,
    },
    attachmentType: {
      type: type.STRING,
    },
    // customerDetailId: {
    //   type: type.INTEGER,
    // },
    url: {
      type: type.STRING,
    },
    documentTypeId: {
      type: type.INTEGER,
    },
    customerName: {
      type: type.STRING,
    },
    approvedDate: {
      type: type.DATE,
    },
    pendingApproval: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: type.INTEGER,
    },
    notes: {
      type: type.STRING,
    },
  });
};
