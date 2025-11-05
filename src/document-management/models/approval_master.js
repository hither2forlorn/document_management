/**
 * Model containing the approval master with main metadata in maker/checker in document
 * @alias ApprovalMaster
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("approval_master", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    initiatorId: {
      type: type.INTEGER,
    },
    type: {
      type: type.STRING,
    },
    currentLevel: {
      type: type.INTEGER,
    },
    assignedTo: {
      type: type.INTEGER,
    },
    approverId: {
      type: type.INTEGER,
    },
  });
};
