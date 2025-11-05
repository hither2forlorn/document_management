const nodemailer = require("nodemailer");
const { EMAIL } = require("./credentials");

const config = {
  host: EMAIL.HOST,
  port: EMAIL.PORT,
  secure: EMAIL.SECURE == "false" ? false : true,
  auth: {
    user: EMAIL.USERNAME, // generated ethereal user
    pass: EMAIL.PASSWORD, // generated ethereal password
  },
};

module.exports.emailTransporter = nodemailer.createTransport(config);
