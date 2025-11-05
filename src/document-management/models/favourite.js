/**
 * Model to store the checkout logs and status for each documents
 * @alias Favourite
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("favourite", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentId: {
      type: type.INTEGER,
      allowNull: false,
    },
    ownerId: {
      type: type.INTEGER,
      allowNull: false,
    },
    isfavourite: {
      type: type.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
  });
};
