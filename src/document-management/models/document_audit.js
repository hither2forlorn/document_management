/**
 * Model to audit the open/update for each documents
 * @alias DocumentAudit
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("document_audit", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    documentId: {
      type: type.INTEGER,
    },
    dateTime: {
      type: type.DATE,
    },
    type: {
      type: type.STRING,
    },
    accessType: {
      type: type.STRING(25),
    },
    accessedBy: {
      type: type.INTEGER,
    },
    message: {
      type: type.TEXT,
    },
  });
};

module.exports.OPEN = "Open";
module.exports.Approve = "Approve";
module.exports.Decline = "Decline";
module.exports.UPDATE = "Update";
module.exports.Resubmit = "Resubmit";
module.exports.CheckOut = "CheckOut";
module.exports.CheckIn = "CheckIn";
