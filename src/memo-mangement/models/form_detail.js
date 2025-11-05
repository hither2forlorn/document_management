/**
 * Model containing other details of form for the control access of form
 * @alias FormDetail
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define(
    "form_detail",
    {
      id: {
        autoIncrement: true,
        type: type.INTEGER,
        primaryKey: true,
      },
      formId: {
        type: type.INTEGER,
      },
      departmentId: {
        type: type.INTEGER,
        defaultValue: null,
      },
      branchId: {
        type: type.INTEGER,
        defaultValue: null,
      },
      isForCustomer: {
        type: type.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );
};
