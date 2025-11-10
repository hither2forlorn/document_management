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

async function execStoredProc(storedProcedureName, params) {
  const query = `EXEC ${storedProcedureName} @FromDate=:fromDate, @ToDate=:toDate, @BranchName=:branchName`;
  return await sequelize.query(query, {
    replacements: {
      fromDate: params.fromDate,
      toDate: params.toDate,
      branchName: params.branchName,
    },
    type: sequelize.QueryTypes.SELECT,
  });
}
async function execStoredProcNew(storedProcedureName, params) {
  const query = `EXEC ${storedProcedureName} @FromDate=:fromDate, @ToDate=:toDate`;
  return await sequelize.query(query, {
    replacements: {
      fromDate: params.fromDate,
      toDate: params.toDate,
    },
    type: sequelize.QueryTypes.SELECT,
  });

}

  async function execQueryWithParams(query, params) {
  return await sequelize.query(query, {
    replacements: params,
    type: sequelize.QueryTypes.RAW,
  });
}

module.exports = { execInsertQuery, execSelectQuery, execUpdateQery, execStoredProc, execStoredProcNew , execQueryWithParams};
