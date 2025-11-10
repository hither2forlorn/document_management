/**
 * Model containing the metadata of the document status change
 * @alias DocumentStatusChange
 * @param {SequelizeInstance} sequelize - Sequelize instance
 * @param {Sequelize} DataTypes - DataTypes module from Sequelize
 */
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("document_status_change", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    prev_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    new_Status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    changed_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
};
