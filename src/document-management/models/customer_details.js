/**
 * Model to store the metadata of the attachments
 * @alias CustomerDetails
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("customer_details", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url: {
      type: type.STRING,
    },
    customer_name: {
      type: type.STRING,
    },
    approved_date: {
      type: type.DATE,
    },
    createdBy: {
      type: type.INTEGER,
    },
  });
};
