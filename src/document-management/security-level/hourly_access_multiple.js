const { User } = require("../../config/database");
const { sendMessage } = require("../../util/send_email");
const { hourlyAccessEmailTemplate } = require("../../util/email_template");

/**
 * Method to send hourlyAccess token request to the user
 * @method module:DocumentSecurityModule#hourlyAccess
 * @param {Object} body
 * @param {Number} body.userId    User ID
 * @param {Date}   body.validTill Expiry Date of the hourly access token
 * @param {URL}    body.url       Generated URL
 */
module.exports.hourlyAccessMultiple = async (body) => {
  const userId = body.userId;
  const userEmail = body.userEmail;
  const attachmentId = body.attachmentId;
  const url = body.id + "&id=" + body.type + "&attachId=" + body.attachmentId + "&hourlyAccessId=" + body.hourlyAccessId;
  const validTill = body.validTill;
  let user;
  if (userId) {
    user = await User.findOne({ where: { id: userId } });
  }
  const success = await sendMessage(
    hourlyAccessEmailTemplate({
      user: {
        name: user ? user.name : userEmail,
        email: user ? user.email : userEmail,
      },
      validTill,
      url,
    })
  );
  return success
    ? { success: true, message: "Email sent" }
    : { success: false, message: "Email not sent. Please, try again later." };
};
