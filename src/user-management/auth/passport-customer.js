const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../../config/database");
const { comparePassword } = require("../../util/user");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findAll({
    where: { id: id },
  }).then((users) => done(users[0]));
});
/**
 * <p>This method is used by passport.js for the authentication of the users</p>
 * <p>This method is used for authentication of CUSTOMER users</p>
 * @method UserManagement#clientLogin
 */
passport.use(
  "client-login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      User.findOne({
        raw: true,
        where: { username: username, type: "customer" },
      }).then((user) => {
        if (!user) {
          return done(null, false, { message: "User not found" });
        } else {
          let loginAttemptsCount = req.body.loginAttemptsCount || user.loginAttemptsCount;
          if (loginAttemptsCount) {
            comparePassword(password, user.password, (err, response) => {
              if (err) {
                return done(err);
              }
              if (response) {
                if (user.expiryDate && user.expiryDate < Date.now()) {
                  return done(null, false, { message: "Password expired!" });
                }
                loginAttemptsCount = user.loginAttempts;
                User.update({ loginAttemptsCount: loginAttemptsCount }, { where: { id: user.id } });
                return done(null, user);
              } else {
                loginAttemptsCount--;
                User.update({ loginAttemptsCount: loginAttemptsCount }, { where: { id: user.id } });
                return done(null, false, {
                  success: response,
                  message: "Incorrect password.",
                });
              }
            });
          } else {
            return done(null, false, {
              message: "Login attempts reached the limit.",
            });
          }
        }
      });
    }
  )
);
