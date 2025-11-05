module.exports = (sequelize, type) => {
  return sequelize.define("district", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    province_id: {
      type: type.INTEGER,
    },
    name: {
      type: type.STRING,
      allowNull: false,
    },
    createdBy: {
      type: type.INTEGER,
    },
    editedBy: {
      type: type.INTEGER,
    },
  });
};
