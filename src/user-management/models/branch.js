module.exports = (sequelize, type) => {
  return sequelize.define("branch", {
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
    name: {
      type: type.STRING,
    },
    street: {
      type: type.STRING,
    },
    city: {
      type: type.STRING,
    },
    country: {
      type: type.STRING,
    },
    postalCode: {
      type: type.STRING,
    },
    phoneNumber: {
      type: type.STRING,
    },
    branchCode: {
      type: type.STRING,
    },
    branchNumber: {
      type: type.INTEGER,
    },
    province: {
      type: type.STRING,
    },
    website: {
      type: type.STRING,
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
