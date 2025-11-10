// utils/auth.js
const client = require("../../config/redis");

/**
 * Clears JWT & refreshToken cookies and removes user session from Redis
 * @param {Object} res - Express response object
 * @param {string|number} userId - User ID to clear from Redis
 */
const clearTokensAndSession = async (res, userId) => {
  try {
    res.clearCookie("jwt", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    if (userId) {
      await client.del(`loggedInUser:${userId}`);
    }
  } catch (error) {
    console.error("Error clearing tokens and session:", error);
  }
};

module.exports = { clearTokensAndSession };
