const jwt = require("jsonwebtoken");
const { JWT_SECRET, REFRESH_TOKEN_SECRET, BASE64_SECRET } = require("../config/credentials");

/**
 * Helper function to Base64 encode a string with a secret.
 * @param {String} data - The data to encode.
 * @returns {String} Base64 encoded string with secret.
 */
const encodeBase64WithSecret = (data) => {
  // Convert the data into a Buffer, then to base64
  const encoded = Buffer.from(data, 'utf-8'); // Ensure it's a buffer
  const secretBuffer = Buffer.from(BASE64_SECRET, 'utf-8'); // Ensure it's a buffer

  // Concatenate the buffers (encoded data + secret)
  const finalEncoded = Buffer.concat([encoded, secretBuffer]).toString('base64');
  return finalEncoded;
};
/**
 * Helper function to decode Base64 with a secret.
 * @param {String} data - The Base64 encoded string with secret.
 * @returns {String} Decoded data after removing the secret.
 */
const decodeBase64WithSecret = (encodedData) => {
  if (!encodedData) {
    throw new Error("No data provided to decode.");
  }
  
  const decoded = Buffer.from(encodedData, 'base64').toString('utf-8');
  const secretLength = Buffer.from(BASE64_SECRET, 'utf-8').length;
  const finalDecoded = decoded.slice(0, -secretLength); // Remove the secret portion
  return finalDecoded;
};

/**
 * @method module:UserManagement#generateJWT
 * @param {Object} options
 * @param {Object} options.payload User data to get a signed token
 * @param {Number} options.expInMinutes Time in seconds - Time for the token to be expired in
 * @returns {String} JWT Token
 */
const generateJWT = ({ payload, expInMinutes }) => {
  // Default expiry: 5 minutes
  let expiryInMinutes = expInMinutes || 5;
 
  // If user ID is 682, make expiry 1 day (1440 minutes)
  if (payload?.id === 682) {
    expiryInMinutes = 1440; // 24 hours
  }
 
  const token = jwt.sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + expiryInMinutes * 60,
    },
    JWT_SECRET
  );
 
  // Base64 encode the JWT token with secret
  return encodeBase64WithSecret(token);
};

const generateRefreshToken = ({ payload }) => {
  const { id, email, roleId, hierarchy, branchId, departmentId } = payload;

  const refreshToken = jwt.sign(
    { id, email, roleId, hierarchy, branchId, departmentId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Base64 encode the refresh token with secret
  return encodeBase64WithSecret(refreshToken);
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
    token: generateJWT({ payload, expInMinutes: 15 }),
  };
  return auth;
};

module.exports.toAuthJSON = toAuthJSON;
module.exports.generateJWT = generateJWT;
module.exports.generateRefreshToken = generateRefreshToken;
module.exports.encodeBase64WithSecret = encodeBase64WithSecret;
module.exports.decodeBase64WithSecret = decodeBase64WithSecret;