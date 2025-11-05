/**
 * Model containing the memo details started by the client
 * @alias MemoClient
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("memo_client", {
    id: {
      autoIncrement: true,
      type: type.INTEGER,
      primaryKey: true,
    },
    memoId: {
      type: type.INTEGER,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: type.STRING,
    },
    email: {
      type: type.STRING,
    },
  });
};
