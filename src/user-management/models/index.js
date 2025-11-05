module.exports = (sequelize, Sequelize) => ({
  User: require("./user")(sequelize, Sequelize),
  ProfilePicture: require("./profile_picture")(sequelize, Sequelize),
  Role: require("./role")(sequelize, Sequelize),
  RoleType: require("./role_type")(sequelize, Sequelize),
  RoleControl: require("./role_control")(sequelize, Sequelize),
  Branch: require("./branch")(sequelize, Sequelize),
  BranchLogo: require("./branch_logo")(sequelize, Sequelize),
  Department: require("./department")(sequelize, Sequelize),
  District: require("./district")(sequelize, Sequelize),
  Province: require("./province")(sequelize, Sequelize),
});
