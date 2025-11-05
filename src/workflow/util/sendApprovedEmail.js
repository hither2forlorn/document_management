const { sendMessage } = require("../../util/send_email");
const { approvalEmailTemplate } = require("../../util/email_template");

module.exports.sendApprovedEmail = (clientEmail) => {
  const emailAddress = clientEmail;
  const success = sendMessage(approvalEmailTemplate(emailAddress)).catch((err) => console.log(err));
  return success
    ? { success: true, message: "Email Sent" }
    : { success: false, message: "Email not sent. Please try again later." };
};
