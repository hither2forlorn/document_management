const router = require("express").Router();
const passport = require("passport");
const { toAuthJSON } = require("../../util/jwt");

router.post("/signin", (req, res, next) => {
  passport.authenticate("client-login", (err, passportUser, info) => {
    if (err) return next(err);
    if (passportUser) {
      const user = passportUser;
      return res.send({ success: true, user: toAuthJSON(user, "client") });
    } else {
      return res.send(info);
    }
  })(req, res, next);
});

module.exports = router;
