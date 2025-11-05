/**
 * Model to store the location type for the location map
 * @alias <CustomWatermark></CustomWatermark>
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("custom_watermarks", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    watermarkText: {
      type: type.STRING,
      allowNull: true,
    },
    watermarkImagePath: {
      type: type.STRING,
      allowNull: true,
    },
    watermarkPosition: {
      type: type.STRING,
      allowNull: true,
    },
    isPreferred: {
      type: type.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    useDefaultSettings: {
      type: type.BOOLEAN,
    },
    createdBy: {
      type: type.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: type.DATE,
      defaultValue: type.NOW,
      allowNull: true,
    },
    updatedAt: {
      type: type.DATE,
      allowNull: true,
    },
  });
};
