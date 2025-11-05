module.exports = (sequelize, type) => {
  return sequelize.define("profile_picture", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    profilePicture: {
      type: type.BLOB("long"),
    },
    userId: {
      type: type.INTEGER,
      unique: true,
    },
  });
};
