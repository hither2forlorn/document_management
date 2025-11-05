/**
 * Model containing the logs of deleted data
 * @method module:DeleteModule#DeleteModel
 * @alias DeleteModel
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("constant", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    indexType: {
      type: type.STRING,
    },
    name: {
      type: type.STRING,
    },
  });
};
