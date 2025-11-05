/**
 * Model containing the form data
 * @alias Form
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define(
    "form",
    {
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
      isActive: {
        type: type.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      type: {
        type: type.STRING(20),
        defaultValue: "dynamic",
      },
      workflowId: {
        type: type.INTEGER,
      },
      name: {
        type: type.STRING,
        allowNull: false,
      },
      description: {
        type: type.STRING,
        allowNull: false,
      },
      tag: {
        type: type.STRING,
      },
      formData: {
        type: type.TEXT,
      },
      css: {
        type: type.TEXT,
      },
      javascript: {
        type: type.TEXT,
      },
      createdBy: {
        type: type.INTEGER,
      },
      editedBy: {
        type: type.INTEGER,
      },
    },
    {
      defaultScope: {
        where: { isDeleted: false },
      },
    }
  );
};
