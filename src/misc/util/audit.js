// const { AuditLog, sequelize } = require('./database');

// function compareObjects(previousObject, newObject) {
//     const valueChanges = [];
//     delete previousObject.createdAt;
//     delete previousObject.updatedAt;
//     const keys = Object.keys(previousObject);
//     keys.map(key => {
//         const previousValue = previousObject[key];
//         const newValue = newObject[key];
//         if (previousValue != newValue) {
//             valueChanges.push({
//                 columnName: key,
//                 previousValue: JSON.stringify(previousValue),
//                 newValue: JSON.stringify(newValue),
//             });
//         }
//     });
//     return valueChanges;
// }

// async function auditData(Model, newObject, payload) {
//     const previousObject = await Model.findOne({ where: { id: newObject.id }, raw: true });
//     const tableName = Model.getTableName();
//     if (previousObject) {
//         const valueChanges = compareObjects(previousObject, newObject);
//         const auditFormat = {
//             userId: payload.id,
//             userName: payload.name,
//             itemId: newObject.id,
//             tableName: tableName,
//         };
//         Promise.all([
//             valueChanges.map(value => {
//                 const auditLog = {
//                     ...value,
//                     ...auditFormat,
//                 }
//                 return AuditLog.create(auditLog);
//             })
//         ]);
//     }
// }

// module.exports = {
//     auditData
// }
