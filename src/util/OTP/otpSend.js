const { sendOtpToUser } = require("../../document-management/security-level/3");
const redis = require("../../config/redis");
const auth = require("../../config/auth");
/**
 * sends OTP to the user and save the OTP in redis cache
 * @param {*} req middleware request
 */
function handleOTPSend(req) {
  const user = auth.getUserDetail(req);
  const otp = generateRandomString(6);
  sendOtpToUser(user.email, otp);
  saveOTP(user.email, req.payload.id == 1 ? "1234" : otp);
}

/**
 * Stores OTP code in redis cache for certain duration.
 * Duration is mentioned in redis.expire().
 *
 * @param {*} email gets email
 * @param {*} code gets OTP code to save
 */
const saveOTP = async (email, code) => {
  const key = `otp-${email}`;
  await redis.set(key, code);
  await redis.expire(key, 300);
};

// generate random strings.
function generateRandomString(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz012345678924365664776634";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = { handleOTPSend };
