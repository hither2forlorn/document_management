module.exports = (sequelize, Sequelize) => ({
  AuditLog: require("./audit_log")(sequelize, Sequelize),
  LoginLog: require("./login_log")(sequelize, Sequelize),
  DeleteLog: require("./delete_log")(sequelize, Sequelize),
  OtpCode: require("./otp_code")(sequelize, Sequelize),
  Constant: require("./constant")(sequelize, Sequelize),
});
