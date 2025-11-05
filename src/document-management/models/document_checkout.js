/**
 * Model to store the checkout logs and status for each documents
 * @alias DocumentCheckout
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("document_checkout", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isReturned: {
      type: type.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    userId: {
      type: type.INTEGER,
      allowNull: false,
    },
    documentId: {
      type: type.INTEGER,
      allowNull: false,
    },
    description: {
      type: type.TEXT,
    },
  });
};
