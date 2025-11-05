/**
 * Model containing the OTP codes to verify the respective users
 * @alias OTPCode
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("otp_code", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    isValid: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
    code: {
      type: type.STRING(10),
      allowNull: false,
    },
    email: {
      type: type.STRING,
    },
    phone: {
      type: type.INTEGER,
    },
    expiryDate: {
      type: type.DATE,
    },
  });
};
