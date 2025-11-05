const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../../config/database");
const DEVELOPMENT_ENV = require("../../util/checkNodeEnv");
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
 * <p>This method is used for authentication of ADMIN users</p>
 * @method UserManagement#adminLogin
 */
passport.use(
  "admin-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      User.findAll({
        raw: true,
        where: { email: email, type: "admin", isDeleted: false },
      }).then((users) => {
        if (users === undefined || users.length == 0) {
          return done(null, false, { message: "" });
        } else {
          const user = users[0];
          if (user.statusId == 2) {
            return done(null, false, {
              message: "Please contact your Administrator",
            });
          } else if (user.statusId == 3) {
            return done(null, false, {
              message: "Your account has been suspended.",
            });
          }

          let loginAttemptsCount = req.body.loginAttemptsCount || user.loginAttemptsCount;
          if (loginAttemptsCount) {
            if (DEVELOPMENT_ENV) {
              return done(null, user);
            }
            comparePassword(password, user.password, (err, response) => {
              if (err) {
                return done(err);
              }
              if (response) {
                // Donot allow user if date is expired
                if (user.expiryDate && new Date(user.expiryDate) < new Date()) {
                  return done(null, false, { message: "User expired!. Please Contact your Administrator" });
                }

                // rest login count on successful login
                loginAttemptsCount = user.loginAttempts;
                User.update({ loginAttemptsCount: loginAttemptsCount }, { where: { id: user.id } });
                return done(null, user);
              } else {
                loginAttemptsCount--;
                User.update({ loginAttemptsCount: loginAttemptsCount }, { where: { id: user.id } });
                return done(null, false, {
                  success: response,
                  // message: "Incorrect password.",
                });
              }
            });
          } else {
            return done(null, false, {
              message: "Login attempts reached the limit. Please contact administrator",
            });
          }
        }
      });
    }
  )
);
