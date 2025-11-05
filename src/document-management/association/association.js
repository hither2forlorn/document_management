// models/associations.js
module.exports = (models) => {
  // HourlyAccess <-> HourlyAccessMultiple
  models.HourlyAccess.hasMany(models.HourlyAccessMultiple, {
    foreignKey: 'hourlyAccessId',
    as: 'hourlyAccessMultiples'
  });
  
  models.HourlyAccessMultiple.belongsTo(models.HourlyAccess, {
    foreignKey: 'hourlyAccessId',
    as: 'hourlyAccess'
  });

models.Document.hasMany(models.ApprovalMaster, {
    foreignKey: 'documentId',
    as: 'ApprovalMaster'
  });
  
  models.ApprovalMaster.belongsTo(models.Document, {
    foreignKey: 'documentId',
    as: 'Document'
  });


};