/**
 * Model to store the watermarking data to watermark the attachments later on
 * @alias Watermark
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("watermark", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isActive: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    isImage: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: type.INTEGER,
    },
    branchId: {
      type: type.INTEGER,
    },
    departmentId: {
      type: type.INTEGER,
    },
    text: {
      type: type.STRING,
      defaultValue: "Gentech",
    },
    image: {
      type: type.STRING,
    },
    colorCode: {
      type: type.STRING(10),
      defaultValue: "#ff0000cc",
    },
    editedBy: {
      type: type.INTEGER,
    },
  });
};
