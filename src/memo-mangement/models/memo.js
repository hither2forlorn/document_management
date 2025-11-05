/**
 * Model containing the meta data of the memo storing requestId and all
 * @alias Memo
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("memo", {
    id: {
      autoIncrement: true,
      type: type.INTEGER,
      primaryKey: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    formId: {
      type: type.INTEGER,
      allowNull: false,
    },
    workflowMasterId: {
      type: type.INTEGER,
    },
    isApproved: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: type.INTEGER,
    },
    editedBy: {
      type: type.INTEGER,
    },
  });
};
