/**
 * Model containing the approval queue in maker/checker in document
 * @alias ApprovalQueue
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("approval_queue", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    approvalMasterId: {
      type: type.INTEGER,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    level: {
      type: type.INTEGER,
    },
    userId: {
      type: type.INTEGER,
    },
    isApprover: {
      type: type.BOOLEAN,
    },
  });
};
