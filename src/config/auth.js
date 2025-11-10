const jwt_decode = require("jwt-decode");
const { JWT_SECRET, BASE64_SECRET } = require("./credentials");
const jwt = require("express-jwt");
const { decodeBase64WithSecret } = require("../util/jwt");

/**
 * This functions gets the token from headers and decodes it.
 *
 * @method
 * @param {Object} req  The object **req** from the express.js method
 *
 * @returns Object with the decoded token for admin/client
 */
const getTokenFromHeaders = (req) => {
  let [admin, client] = [null, null];
  const { headers: { authorization } } = req;
  
  // Check if the JWT cookie exists and decode it
  let jwt = req.cookies?.jwt;
  if (jwt) {
    try {
      jwt = decodeBase64WithSecret(jwt); // Decode the JWT cookie
    } catch (error) {
      console.error("Error decoding JWT cookie:", error);
    }
  }

  // Decode tokens from the authorization header if available
  if (authorization) {
    const tokens = authorization.split(",");
    tokens.forEach((t) => {
      const [bearer, token] = t.split(" ");
      switch (bearer) {
        case "Admin":
          admin = token;
          break;
        case "Client":
          client = token;
          break;
        default:
          break;
      }
    });
  }

  // Decode admin and client tokens from the authorization header
  const decodedAdmin = admin ? decodeBase64WithSecret(admin) : null;
  const decodedClient = client ? decodeBase64WithSecret(client) : null;

  // Return the decoded tokens for admin and client
  return {
    admin: decodedAdmin || jwt,
    client: decodedClient || jwt,
  };
};

/**
 * This object contains the functions to getTokenFromHeaders
 *
 * @method
 * @param {Object} req  The object **req** from the express.js method
 * @property {Method} admin This method is for the **admin** access users
 * @property {Method} client This method is for the **client** access users
 * @returns {Object} Object with the token of admin or client
 */
const getToken = {
  admin: (req) => getTokenFromHeaders(req).admin,
  client: (req) => getTokenFromHeaders(req).client,
};

/**
 * Middleware auth object for routes to limit the access of unauthorized users
 *
 * @property {Middleware} required  Used to throw status 401 for the unauthenticated **admin** users
 * @property {Middleware} optional  Used to know the user accessing the route even if the token is not valid
 * @property {Middleware} client    Used to throw status 401 for the unauthenticated **client** users
 *
 */
const auth = {
  required: jwt({
    secret: JWT_SECRET,
    userProperty: "payload",
    getToken: getToken.admin,
    algorithms: ["HS256"],
  }),
  optional: jwt({
    secret: JWT_SECRET,
    userProperty: "payload",
    getToken: getToken.admin,
    credentialsRequired: false,
    algorithms: ["HS256"],
  }),
  client: jwt({
    secret: JWT_SECRET,
    userProperty: "payload",
    getToken: getToken.client,
    algorithms: ["HS256"],
  }),
  getUserDetail: getUserDetail,
  getToken: getTokenFromHeaders,
};

/**
 * Decoding the user details from base64 and then using jwt decode
 * @param {*} req user details
 * @returns Decoded user details
 */
function getUserDetail(req) {
  const encodedToken = getToken.admin(req);

  if (!encodedToken) {
    throw new Error("No token provided.");
  }

  try {
    // Decode the token from Base64 with the secret
    const decodedToken = decodeBase64WithSecret(encodedToken);

    // Then decode it using jwt_decode to get the payload
    const user = jwt_decode(decodedToken, JWT_SECRET);

    // Access token expiry check
    const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds
    if (user.exp && user.exp < currentTime) {
      throw new Error("Access token expired");
    }

    return user;
  } catch (error) {
    console.error("Error decoding token:", error);
    throw new Error("Invalid or expired token");
  }
}
module.exports = auth;
