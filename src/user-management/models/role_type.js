module.exports = (sequelize, type) => {
  return sequelize.define("role_type", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isDeleted: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    name: {
      type: type.STRING,
      allowNull: false,
    },
    key: {
      type: type.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: type.ENUM({
        values: ["page", "boolean"],
      }),
      allowNull: false,
      defaultValue: "page",
    },
    description: {
      type: type.TEXT,
      allowNull: true,
    },
  });
};
