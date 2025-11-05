/**
 * Model to store the security level for the documents
 * <p> The value field must be static 1/2/3 - supported now</p>
 * <p></p>
 * <p> 1 --> Low = Anyone who has access to the document can view the document</p>
 * <p> 2 --> Medium = Hierarchial level security</p>
 * <p> 3 --> High = Direct user access needed to be provided to view the document</p>
 * @alias SecurityLevel
 * @param {SequelizeInstance} sequelize - Sequelize instance with DB_CREDENTIALS
 * @param {Sequelize} type - require('sequelize')
 */
module.exports = (sequelize, type) => {
  return sequelize.define("security_level", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: type.INTEGER,
    },
    name: {
      type: type.STRING,
    },
    description: {
      type: type.STRING,
    },
  });
};
