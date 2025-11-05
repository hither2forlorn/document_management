/**
 * Model containing the changes updated by the user
 * @method module:AuditLogs#AuditLogModel
 * @alias DeleteModel
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("audit_log", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: type.INTEGER,
    },
    userDetail: {
      type: type.STRING,
    },
    itemId: {
      type: type.INTEGER,
    },
    tableName: {
      type: type.STRING,
    },
    columnName: {
      type: type.STRING,
    },
    previousValue: {
      type: type.TEXT,
    },
    newValue: {
      type: type.TEXT,
    },
  });
};
