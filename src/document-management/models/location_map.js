/**
 * Model to store the physical location metadata for the document
 * @alias LocationMap
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("location_map", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    level: {
      type: type.INTEGER,
      defaultValue: 0,
    },
    name: {
      type: type.STRING,
    },
    description: {
      type: type.TEXT,
    },
    parentId: {
      type: type.INTEGER,
    },
    locationTypeId: {
      type: type.INTEGER,
    },
    multipleHierarchy: {
      type: type.INTEGER,
    },
    hierarchy: {
      type: type.STRING,
    },
    createdBy: {
      type: type.INTEGER,
    },
    editedBy: {
      type: type.INTEGER,
    },
  });
};
