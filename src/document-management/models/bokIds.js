/**
 * Model to store the metadata of the bokids attachments
 * @alias CustomerDetails
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("bokIds", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    attachmentId: {
      type: type.INTEGER,
    },
    createdBy: {
      type: type.INTEGER,
    },
  });
};
