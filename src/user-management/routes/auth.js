const router = require("express").Router();
const passport = require("passport");
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { LoginLog, User } = require("../../config/database");
const timeout = require("connect-timeout");
const { toAuthJSON } = require("../../util/jwt");
const { signInLdap } = require("../util/user_ldap_auth");

const { LDAP: ldapOptions } = require("../../config/credentials");
const { consoleLog } = require("../../util");

router.post("/signin", timeout("10s"), (req, res, next) => {
  passport.authenticate(
    ["ad-login", "admin-login"],
    { session: true, failureMessage: true },
    (err, passportUser, message) => {
     
      if (err) {
        logger.error(err);
        res.status(500).send("Error!");
        return;
      }
      
      let distinguishedName;
      if (passportUser) {
        const user = passportUser;
        distinguishedName = user.distinguishedName;
        console.log(distinguishedName)
        LoginLog.create({
          userId: user.id,
          email: user.email,
          loginIp: req.ip || "",
          login: Date.now(),
        }).then((_) => {
          // reset user login attempts
          User.update({ loginAttemptsCount: user.loginAttempts }, { where: { id: user.id } });
        });
        // Creates Secure Cookie with refresh token
        res.cookie('jwt', toAuthJSON(user, "admin")?.token, {
          httpOnly: true,
          //  secure: false, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000
        });

        return res.send({ success: true, user: toAuthJSON(user, "admin") });
      } else {
        res.send({
          success: false,
          message: message.length > 0 ? message.map((a) => `${a.message}`).join(" ") : "Incorrect Credentials",
        });
      }
    }
  )(req, res, next);
});

router.get("/user/logout", auth.optional, (req, res, next) => {
  LoginLog.findOne({
    where: { userId: req.payload.id },
    attributes: ["id"],
    order: [["createdAt", "DESC"]],
  }).then((log) => {
    if (log) {
      LoginLog.update(
        {
          logout: Date.now(),
          loginIp: req.ip || "",
        },
        {
          where: { id: log.id },
        }
      );
    }
  });
  res.clearCookie("jwt")
  res.json({ success: true });
});

module.exports = router;
