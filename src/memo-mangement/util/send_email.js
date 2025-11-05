const { memoInitiateEmailTemplate, memoApproveEmailTemplate } = require("../../util/email_template");
const { sendMessage } = require("../../util/send_email");

module.exports.sendInitiateEmail = async ({ email, requestId }) => {
  return sendMessage(memoInitiateEmailTemplate({ email, requestId }));
};

module.exports.sendApproveEmail = async ({ email, requestId }) => {
  return sendMessage(memoApproveEmailTemplate({ email, requestId }));
};
