/**
 * Model containing the form values filled by the user which will be stored as name/value pairs
 * @alias MemoValue
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("memo_value", {
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
    memoId: {
      type: type.INTEGER,
      allowNull: false,
    },
    name: {
      type: type.STRING,
      allowNull: false,
    },
    value: {
      type: type.TEXT,
    },
  });
};
