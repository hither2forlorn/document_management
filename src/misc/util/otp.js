const { otpEmailTemplate } = require("../../util/email_template");
const { sendMessage } = require("../../util/send_email");
const { OtpCode } = require("../../config/database");
const { } = require("../");
const Op = require("sequelize").Op;
const randomize = require("randomatic");
const bcrypt = require("bcryptjs");
const client = require("../../config/redis")




module.exports.sendOtpByEmail = async ({ userId, email }) => {
  const randomValue = randomize("0", 6);
  const hashCode = await bcrypt.hash(randomValue, 10);
  try {
    const emailSent = await sendMessage(otpEmailTemplate(email, randomValue));
    if (emailSent) {
      await client.set(`otp:${userId}`, hashCode, "EX", 60)
      return { success: true, message: "Email sent", otpCode: randomValue }
    }
  } catch (error) {
    return { success: false, message: "Email not sent. Please try again later." };
  }
};
