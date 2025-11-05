module.exports = (sequelize, type) => {
  return sequelize.define("branch_logo", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    branchLogo: {
      type: type.BLOB("long"),
    },
    branchId: {
      type: type.INTEGER,
    },
  });
};
