/**
 * Model to store the hourly access token for each document and respective userId
 * @alias HourlyAccess
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("hourly_access", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: type.INTEGER,
      // allowNull: false,
    },
    userEmail: {
      type: type.STRING,
    },
    documentId: {
      type: type.INTEGER,
      allowNull: false,
    },
    attachmentId: {
      type: type.INTEGER,
      allowNull: true,
    },
    validTill: {
      type: type.DATE,
      allowNull: false,
    },
    token: {
      type: type.STRING,
      allowNull: false,
    },
    createdBy: {
      type: type.INTEGER,
    },
  });
};
