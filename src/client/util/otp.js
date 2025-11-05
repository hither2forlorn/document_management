const { otpEmailTemplate } = require("../../util/email_template");
const { sendMessage } = require("../../util/send_email");
const { OtpCode } = require("../../config/database");
const Op = require("sequelize").Op;
const randomize = require("randomatic");
const { generateJWT } = require("../../util/jwt");
const redis = require("../../config/redis");
const { promisify } = require("util");

module.exports.sendOtpByEmail = async ({ email }) => {
  const randomValue = randomize("0", 6);
  await OtpCode.create({
    code: randomValue,
    email: email,
    isValid: true,
    expiryDate: Date.now() + 100 * 60 * 1000, // 15 minutes
  });
  const success = await sendMessage(otpEmailTemplate(email, randomValue)).catch((err) => console.log(err));
  return success
    ? { success: true, message: "Email sent", otpCode: randomValue }
    : { success: false, message: "Email not sent. Please try again later." };
};

module.exports.verifyOtp = async ({ code, email, phone }) => {
  const searchQuery = {
    code: code,
    isValid: true,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    expiryDate: {
      [Op.gt]: Date.now(),
    },
  };
  const otp = await OtpCode.findOne({
    where: searchQuery,
    attributes: ["id", "isValid"],
    order: [["createdAt", "DESC"]],
  });
  if (otp && otp.isValid) {
    await OtpCode.update({ isValid: false }, { where: { id: otp.id } });
    return { success: true, isVerified: true };
  }
  return { success: false, message: "Invalid Code" };
};

module.exports.verifyOtpDoc = async ({ code, email, phone }) => {
  // const searchQuery = {
  //   code: code,
  //   isValid: true,
  //   ...(email ? { email } : {}),
  //   ...(phone ? { phone } : {}),
  //   expiryDate: {
  //     [Op.gt]: Date.now(),
  //   },
  // };
  // const otp = await OtpCode.findOne({
  //   where: searchQuery,
  //   attributes: ["id", "isValid"],
  //   order: [["createdAt", "DESC"]],
  // });
  const verified = await verifyOTP(email, code);

  if (verified) {
    // await OtpCode.update({ isValid: false }, { where: { id: otp.id } });
    return { success: true, isVerified: true, message: "OTP code verified" };
  }
  return { success: false, message: "Invalid Code" };
};

const verifyOTP = async (email, code) => {
  const redisGet = promisify(redis.get).bind(redis);
  const value = await redisGet(`otp-${email}`);
  if (!value) {
    return false;
  }
  return value == code;
};
