const bcrypt = require("bcryptjs");

module.exports.hashPassword = (password, callback) => {
  bcrypt.hash(password, 10, callback);
};

module.exports.comparePassword = (password, hash, callback) => {
  bcrypt.compare(password, hash, callback);
};

module.exports.comparePasswordSync = (password, hash, callback) => {
  return bcrypt.compareSync(password, hash);
};
