const router = require("express").Router();
const logger = require("../../config/logger");
const { sendOtpByEmail, verifyOtp, verifyOtpDoc } = require("../util/otp");
const auth = require("../../config/auth");

router.post("/send-otp/:type", auth.client, async (req, res, next) => {
  const { type } = req.params;
  const { email, phone } = req.payload;
  try {
    switch (type) {
      case "PHONE_OTP":
        res.send();
        break;
      case "EMAIL_OTP":
        sendOtpByEmail({ email }).then((response) => {
          res.send(response);
        });
        break;
      default:
        res.send({ success: false, message: "Request not valid!" });
        break;
    }
  } catch (err) {
    logger.error(err);
    res.status(500).send("Error in sending");
  }
});

router.post("/verify-otp/:type", auth.required, async (req, res, next) => {
  const { type } = req.params;
  // const { email, phone } = req.payload;
  const { email } = auth.getUserDetail(req);
  const code = req.body.data;
  let response = {};
  try {
    switch (type) {
      case "PHONE_OTP":
        response = {
          success: false,
          message: "Phone API under construction",
        };
        break;
      case "EMAIL_OTP":
        // response = await verifyOtp({ code: code, email: email });
        response = await verifyOtpDoc({
          code: code,
          email: email,
        });
        break;
      default:
        response = {
          success: false,
          message: "Request not valid!",
        };
        break;
    }
    res.send(response);
  } catch (err) {
    logger.error(err);
    res.status(500).send("Error in sending");
  }
});

module.exports = router;
