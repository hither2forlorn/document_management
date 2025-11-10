/**
 * Model containing the logs of logged in sessions
 * @alias LoginLog
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("login_log", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: type.STRING,
      allowNull: false,
    },
    email: {
      allowNull: false,
      type: type.STRING,
    },
    login: {
      type: type.DATE,
    },
    loginIp: {
      type: type.STRING,
    },
    logout: {
      type: type.DATE,
    },
    logoutIp: {
      type: type.STRING,
    },
    token: {
      type: type.STRING,
    },
  });
};
