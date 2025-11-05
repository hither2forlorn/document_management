/**
 * Model containing the logs of deleted data
 * @method module:DeleteModule#DeleteModel
 * @alias DeleteModel
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("delete_log", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    itemId: {
      type: type.INTEGER,
    },
    itemType: {
      type: type.STRING,
    },
    deletedOn: {
      type: type.DATE,
    },
    deletedBy: {
      type: type.INTEGER,
    },
  });
};
