/**
 * @module Database
 */
const Sequelize = require("sequelize");
// const SpiderSequelize = require("spider-");
const { DB } = require("./credentials");

/**
 * Create a sequelize database instance
 * @method
 * @param {String} databaseName     Database name
 * @param {String} username         Username to access the database
 * @param {String} password         Password for database access user
 * @param {Object} options          Database connection options
 * @param {String} options.host     Host server for database
 * @param {Number} options.port     Port where database is served
 * @param {String} options.dialect  Dialect for database (mysql,mssql...)
 * @param {Boolean} options.logging 'false' to stop logging of SQL queries
 */

console.log(`|--------------------------------------------`);
console.log("[Database] = ", DB);
console.log(`|--------------------------------------------`);

const sequelize = new Sequelize(DB.NAME, DB.USERNAME, DB.PASSWORD, {
  host: DB.HOST,
  port: DB.PORT,
  dialect: DB.DIALECT,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
});
const bok_lms_Sequelize = new Sequelize("TOG_BOK_UAT_Final_Live", "dms", "Connect@dms", {
  host: "skale-db.bok.com.np",
  port: 1433,
  dialect: DB.DIALECT,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
const bok_cbs_Sequelize = new Sequelize("bokmis", "SKALE_TEST", "SKALE_TEST", {
  host: "misdb.bok.com.np:1521",
  port: 1433,
  dialect: DB.DIALECT,
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const UserMgmtModels = require("../user-management/models")(sequelize, Sequelize);
const DocumentMgmtModels = require("../document-management/models")(sequelize, Sequelize);
const LogsMgmtModels = require("../logs/models")(sequelize, Sequelize);
const MiscModels = require("../misc/models")(sequelize, Sequelize);
const MemoMgmtModels = require("../memo-mangement/models")(sequelize, Sequelize);
const SecurityHierarchyModels = require("../security-hierarchy/model")(sequelize, Sequelize);
const WorkflowModels = require("../workflow/models")(sequelize, Sequelize);

/**
 * Synchronize with database to create tables - Promise
 *
 * @method
 * @alias sync
 * @param {Object}    options         Options for syncing with database
 * @param {Boolean}   options.force   Enables/Disables the creation of tables forcefully - `WARNING!!!` (Do not set value to **true** during **production**)
 */
sequelize.sync().then(() => {
  console.log(`|--------------------------------------------`);
  console.log(`| Database connected!`);
  console.log(`|--------------------------------------------`);
});

const oracleCredentials = {
  user: "SKALE_TEST",
  password: "SKALE_TEST",
  connectionString: "misdb.bok.com.np:1521/bokmis",
};

module.exports = {
  ...UserMgmtModels,
  ...DocumentMgmtModels,
  ...MemoMgmtModels,
  ...WorkflowModels,
  ...LogsMgmtModels,
  ...MiscModels,
  ...SecurityHierarchyModels,
  sequelize,
  bok_lms_Sequelize,
  oracleCredentials,
  SequelizeInstance: sequelize,
};
