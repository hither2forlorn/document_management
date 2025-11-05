const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../../config/database");
const Op = require("sequelize").Op;
const { signInLdap } = require("../util/user_ldap_auth");
const logger = require("../../config/logger");
const { authenticate } = require("./ad-auth");
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
* <p>This method is used for authentication of AD users</p>
* @method UserManagement#adUserLogin
*/
passport.use(
  "ad-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      if (username && password) {
        User.findOne({
          where: {
            [Op.or]: [
              { email: username },
              { username: username },
            ],
            type: "admin",
            isDeleted: false,
            isActive: true,
          },
        })
          .then((user) => {
            if (user) {
              let attempts = user.loginAttemptsCount;
              if (attempts > 0) {
                // Check the environment and decide whether to update the attempts immediately
                if (process.env.NODE_ENV === "development") {
                   User.update({ loginAttemptsCount: user.loginAttempts }, { where: { id: user.id } });
                  return done(null, user);
                  // For dev environment, don't decrease attempts before LDAP check
                } else {
                  authenticate(user.distinguishedName, password, (err, result) => {
                    if (result) {
                      // If authentication is successful, reset attempts and continue
                      user.update({ loginAttemptsCount: user.loginAttempts }, { where: { id: user.id } });
                      return done(null, user);
                    } else {
                      // Authentication failed
                      attempts--;
                      if (attempts === 0) {
                        user.update({ loginAttemptsCount: attempts }, { where: { id: user.id } });
                        return done(null, false, { message: "Login attempts exceeded!" });
                      } else {
                        // Update the attempts and continue with the error message
                        user.update({ loginAttemptsCount: attempts }, { where: { id: user.id } });
                        return done(null, false, { message: "Invalid Credentials!" });
                      }
                    }
                  });
                }
              } else {
                // If attempts <= 0, user is locked out
                return done(null, false, { message: "Login attempts exceeded!" });
              }
            } else {
              return done(null, false, { message: "User not found" });
            }
          })
          .catch((err) => {
            logger.error(err);
            return done(null, false, { message: "Error occurred!" });
          });
      }
    }
  )
);