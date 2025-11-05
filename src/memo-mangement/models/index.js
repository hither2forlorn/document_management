module.exports = (sequelize, Sequelize) => ({
  Form: require("./form")(sequelize, Sequelize),
  FormDetail: require("./form_detail")(sequelize, Sequelize),
  Memo: require("./memo")(sequelize, Sequelize),
  MemoValue: require("./memo_value")(sequelize, Sequelize),
  MemoClient: require("./memo_client")(sequelize, Sequelize),
});
