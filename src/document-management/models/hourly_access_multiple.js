/**
 * Model to store the hourly access token for each document and respective userId
 * @alias HourlyAccess
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("hourly_access_multiple", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attachmentId: {
      type: type.INTEGER,
      allowNull: true,
    },
  });
};
