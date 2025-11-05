module.exports = (sequelize, Sequelize) => ({
  Logs: require("./logs")(sequelize, Sequelize),
});
