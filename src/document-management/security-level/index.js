const level3 = require("./3");
const hourlyAccess = require("./hourly_access");

module.exports.addUserAccess = level3.addUserAcessDataDocument;
module.exports.updateUserAccess = level3.updateUserAcessDataDocument;
module.exports.hourlyAccess = hourlyAccess.hourlyAccess;
