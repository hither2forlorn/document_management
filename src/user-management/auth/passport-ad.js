const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { User } = require("../../config/database");
const Op = require("sequelize").Op;
const { signInLdap } = require("../util/user_ldap_auth");
const logger = require("../../config/logger");

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
      process.env.NODE_ENV === "development" ? console.log(username, password) : null;
      if (username && password) {
        User.findOne({
          where: {
            [Op.or]: [
              {
                email: username,
              },
              {
                username: username,
              },
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
                if (process.env.NODE_ENV === "development") {
                  User.update({ loginAttemptsCount: user.loginAttempts }, { where: { id: user.id } });
                  return done(null, user);
                } else {
                  signInLdap(user.distinguishedName, password, (result) => {
                    if (result) {
                      User.update({ loginAttemptsCount: user.loginAttempts }, { where: { id: user.id } });
                      return done(null, user);
                    } else {
                      attempts--;
                      res.status(401).send(false);
                      if (attempts === 0) User.update({ isActive: false }, { where: { id: user.id } });
                      User.update({ loginAttemptsCount: attempts }, { where: { id: user.id } });
                      return done(null, false, {
                        message: "Login attempts exceeded!",
                      });
                    }
                  });
                }
              } else {
                return done(null, false, {
                  message: "Login attempts exceeded!",
                });
              }
            } else {
              return done(null, false, {
                message: "User not found",
              });
            }
          })
          .catch((err) => {
            logger.error(err);
            return done(null, false, {
              message: "Error occurred!",
            });
          });
      }
    }
  )
);
