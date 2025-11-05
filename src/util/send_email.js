/**
 * @module Email
 */
const { emailTransporter: transporter } = require("../config/email");
const logger = require("../config/logger");
const { EMAIL } = require("../config/credentials");

/**
 * The function to send message to the user
 * @method module:Email#sendMessage
 * @param {Object} email Email body
 */
module.exports.sendMessage = async (email) => {
  return transporter
    .sendMail({
      from: EMAIL.USERNAME,
      // from: '"General Technology " <info@generaltechnology.com.np>', // sender address
      ...email,
    })
    .then((info) => {
      if (info.rejected.length) {
        console.log("info.rejected", info.rejected);
      }
      return info;
    })
    .catch((err) => {
      logger.error("Error", err);
    });
};
