const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/credentials");

/**
 * @method module:UserManagement#generateJWT
 * @param {Object} options
 * @param {Object} options.payload User data to get a signed token
 * @param {Number} options.expInMinutes Time in seconds - Time for the token to be expired in
 * @returns {String} JWT Token
 */
const generateJWT = ({ payload, expInMinutes }) => {
  return jwt.sign(
    {
      ...payload,
      exp: parseInt(Date.now() / 1000 + (expInMinutes ? expInMinutes : 300) * 60, 10),
    },
    JWT_SECRET
  );
};

const getPayload = (user, type) => {
  switch (type) {
    case "client":
      return {
        id: user.id,
        email: user.email,
      };
    case "admin":
      return {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        hierarchy: user.hierarchy,
        ...(user.branchId
          ? {
              branchId: user.branchId,
            }
          : {}),
        ...(user.departmentId
          ? {
              departmentId: user.departmentId,
            }
          : {}),
      };
    default:
      return {
        id: user.id,
        username: user.username,
        email: user.email,
      };
  }
};

/**
 * @method module:UserManagement#toAuthJSON
 * @param {Object} user User data to get a signed token
 * @param {Number} type Type of the user - client/admin
 * @returns {Object} Object with the token, id and email of the user which has logged in to the system
 */
const toAuthJSON = function (user, type) {
  const payload = getPayload(user, type);
  const auth = {
    id: user.id,
    email: user.email,
    updatedAt: user.updatedAt,
    isExpirePassword: user.isExpirePassword,
    token: generateJWT({ payload }),
  };
  return auth;
};

module.exports.toAuthJSON = toAuthJSON;
module.exports.generateJWT = generateJWT;
