const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, type) => {
  return sequelize.define("user", {
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
    type: {
      type: type.ENUM({
        values: ["customer", "admin"],
      }),
      defaultValue: "admin",
    },
    identityNo: {
      type: type.STRING,
    },
    distinguishedName: {
      type: type.STRING,
      // primaryKey: true,
      // unique: true,
    },
    email: {
      //AD : userPrincipalName
      type: type.STRING(100),
      primaryKey: true,
      unique: true,
    },
    username: {
      //AD : sAMAccountName
      type: type.STRING(40),
      primaryKey: true,
    },
    name: {
      //AD : givenName + " " + sn
      type: type.STRING(100),
    },
    phoneNumber: {
      //AD : telephoneNumber
      type: type.STRING(20),
    },
    password: {
      type: type.STRING,
    },
    gender: {
      type: type.STRING,
    },
    dateOfBirth: {
      type: type.DATE,
    },
    designation: {
      type: type.STRING,
    },
    dateRegistered: {
      type: type.DATE,
    },
    expiryDate: {
      type: type.DATE,
    },
    roleId: {
      type: type.INTEGER,
    },
    branchId: {
      type: type.INTEGER,
    },
    departmentId: {
      type: type.INTEGER,
    },
    statusId: {
      type: type.INTEGER,
    },
    loginAttempts: {
      type: type.INTEGER,
      defaultValue: 5,
    },
    loginAttemptsCount: {
      type: type.INTEGER,
      defaultValue: 5,
    },
    isSecurePassword: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    isStrongPassword: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    isExpirePassword: {
      type: type.BOOLEAN,
      defaultValue: true,
    },
    lastPasswordChange: {
      type: type.DATE,
      allowNull: true,
      defaultValue: type.NOW,
      field: 'LastPasswordChange', // keeps DB column name if you want PascalCase in DB
    },
    notes: {
      type: type.TEXT,
    },
    editedBy: {
      type: type.INTEGER,
    },
    createdBy: {
      type: type.INTEGER,
    },
    userGroupId: {
      type: type.INTEGER,
    },
    hierarchy: {
      type: type.STRING,
    },
    userGroupId: {
      type: type.INTEGER,
    },
    isLoggedIn: {
      type: type.BOOLEAN,
      defaultValue: false,
    },
  });
};
