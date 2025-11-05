const { sequelize } = require("../config/database");

async function execSelectQuery(query) {
  return await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
}
async function execInsertQuery(query) {
  return await sequelize.query(query, {
    type: sequelize.QueryTypes.INSERT,
  });
}
async function execUpdateQery(query) {
  return await sequelize.query(query, {
    type: sequelize.QueryTypes.UPDATE,
  });
}

module.exports = { execInsertQuery, execSelectQuery, execUpdateQery };
