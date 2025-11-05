/**
 * Model containing the list of userId and documentId
 * to limit the access of each documents
 * @alias DocumentAccessUser
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("document_access_user", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentId: {
      type: type.INTEGER,
    },
    userId: {
      type: type.INTEGER,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
  });
};
