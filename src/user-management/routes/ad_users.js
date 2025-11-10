const router = require("express").Router();
const Op = require("sequelize").Op;
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { User } = require("../../config/database");
const { getUsers } = require("../util/user_ldap_auth");
const timeout = require("connect-timeout"); //express v4
const { auditData } = require("../../config/audit");
const USER_TYPE = "admin";

router.get("/ad-users/ldap", timeout("10s"), auth.required, (req, res, next) => {
  getUsers((users) => {
    console.log(users);
    res.send(
      users.filter((user) => (user.name === "Administrator" || user.name === "Guest" || user.name === "krbtgt" ? 0 : 1))
    );
  });
});

router.get("/ad-users", auth.required, (req, res, next) => {
  User.findAll({
    where: { isDeleted: false, type: USER_TYPE },
  })
    .then((users) => {
      const adUsers = users.filter((user) => user.distinguishedName != null);
      res.send(adUsers);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send(false);
    });
});

router.get("/ad-users/:id", auth.required, (req, res, next) => {
  User.findOne({
    where: { id: req.params.id, type: USER_TYPE },
  })
    .then((user) => res.send(user))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(false);
    });
});

router.put("/ad-users/:id", auth.required, (req, res, next) => {
  const user = req.body;
  user.loginAttemptsCount = user.loginAttempts;
  //AUDIT STARTS HERE
  auditData(User, user, req.payload);
  //AUDIT ENDS HERE
  User.update(user, {
    where: { id: req.params.id, type: USER_TYPE },
  })
    .then((_) => res.send(true))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(false);
    });
});

router.post("/ad-users", auth.required, (req, res, next) => {
  const user = {
    type: USER_TYPE,
    email: req.body.userPrincipalName ? req.body.userPrincipalName : "",
    username: req.body.sAMAccountName ? req.body.sAMAccountName : "",
    distinguishedName: req.body.distinguishedName ? req.body.distinguishedName : "",
    name: (req.body.givenName ? req.body.givenName : "") + " " + (req.body.sn ? req.body.sn : ""),
    phoneNumber: req.body.telephoneNumber ? req.body.telephoneNumber : "",
    roleId: req.body.roleId ? req.body.roleId : "",
    branchId: req.body.branchId ? req.body.branchId : "",
    departmentId: req.body.departmentId ? req.body.departmentId : "",
    loginAttempts: req.body.loginAttempts ? req.body.loginAttempts : "",
    loginAttemptsCount: req.body.loginAttempts ? req.body.loginAttempts : "",
    createdBy: req.body.createdBy ? req.body.createdBy : "",
  };
  User.create(user)
    .then((_) => res.send(true))
    .catch((err) => {
      logger.error(err);
      res.status(500).send(false);
    });
});

router.delete("/ad-users/:id", auth.required, (req, res, next) => {
  User.update(
    {
      isDeleted: true,
    },
    {
      where: { id: req.params.id, type: USER_TYPE },
    }
  )
    .then((_) => {
      res.send("Successful!");
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

module.exports = router;
