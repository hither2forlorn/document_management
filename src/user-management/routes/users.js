const router = require("express").Router();
const passport = require("passport");
const { comparePasswordSync, hashPassword } = require("../../util/user");
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { deleteItem, USER } = require("../../config/delete");
const { User, LoginLog, ProfilePicture } = require("../../config/database");
const validator = require("../../util/validation");
const { userValidator, userEditValidator, passwordValidator } = require("../../validations/user");
const { sendMessage } = require("../../util/send_email");
const { newUserEmailTemplate } = require("../../util/email_template");
const { availableHierarchy } = require("../../util/hierarchyManage");
const sameUser = require("../util/sameUser");
const ValidationError = require("../../errors/validation");
const { respond } = require("../../util/response");
const { excludeThisVendor, banks } = require("../../config/selectVendor");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");
const isSuperAdmin = require("../../document-management/sqlQuery/isSuperAdmin");
const { Op } = require("sequelize");
const { execSelectQuery } = require("../../util/queryFunction");

async function updateUser(req, user, callback) {
  const profilePicture = {
    profilePicture: user.profilePicture,
    userId: user.id,
  };

  // To maintain log
  const previousValue = await findPreviousData(constantLogType.USER, user.id, req.method);

  let log_query;
  hashPassword(user.password, (err, hash) => {
    user.password = hash;
    User.update(user, {
      // To maintain log
      logging: (sql) => (log_query = sql),
      raw: true,
      where: { id: user.id, isDeleted: false },
    })
      .then((_) => {
        // To maintain log
        createLog(req, constantLogType.USER, user.id, log_query, previousValue);
        if (profilePicture.profilePicture) {
          ProfilePicture.update(profilePicture, {
            where: { userId: profilePicture.userId },
          }).then((count) => {
            if (count[0] === 0) {
              ProfilePicture.create(profilePicture)
                .then((_) => {
                  callback({
                    success: true,
                    message: "User successfully updated!",
                  });
                })
                .catch((err) => {
                  callback({
                    success: true,
                    message: "Profile Picture Too Large!",
                  });
                });
            } else {
              callback({
                success: true,
                message: "User successfully updated!",
              });
            }
          });
        } else {
          callback({ success: true, message: "User successfully updated!" });
        }
      })
      .catch((err) => {
        callback(err);
      });
  });
}

router.post("/forgotpassword", auth.optional, (req, res, next) => {
  const { id, password } = req.body;
  /*

    *       Sending links to the email ID with the forgot password links
    */
  res.send(forgotUser(id, password));
});

router.post("/user", [validator(userValidator), auth.required, validator(passwordValidator)], async (req, res, next) => {
  // To maintain log
  let log_query;

  const user = req.body;
  // checking if the deleted user exists
  const foundDeletedUser = await User.findOne({
    where: { isDeleted: true, email: user.email },
  });

  // checking if the user with same email and identity no. exists
  const duplicateUser = await User.findOne({
    where: {
      [Op.or]: [{ email: user.email }, { identityNo: user.identityNo }],
    },
  });
  // updating the existing user
  if (foundDeletedUser) {
    hashPassword(user.password, async (err, hash) => {
      req.body.password = hash;
      const updateData = { isDeleted: false, ...req.body };
      await User.update(updateData, {
        where: { id: foundDeletedUser.id, email: user.email },
      });
    });
    return res.send({ success: true, message: "Successful!" });
  } else {
    // validating duplicate user
    if (duplicateUser) {
      return res.status(409).send({ success: false, message: "Duplicate User!" });
    } else {
      const profilePicture = {
        profilePicture: user.profilePicture,
      };
      user.username = user.username ? user.username : user.email;
      user.loginAttemptsCount = user.loginAttempts;
      user.type = user.userType;
      const firstName = req.body.name.split(" ")[0];
      const { userType, password } = req.body;
      hashPassword(user.password, async (err, hash) => {
        if (err) {
          console.log(err);
          // res.status(500).send({ message: "Error occurred!" });
        } else {
          // To maintain log
          const previousValue = await findPreviousData(constantLogType.USER, user.id, req.method);

          user.password = hash;

          const userCountResult = await execSelectQuery("SELECT COUNT(*) AS count FROM USERS WHERE isDeleted = 0");
          const userCount = userCountResult[0]?.count;
          if (userCount <= 100) {
            User.create(user, {
              // To maintain log
              logging: (sql) => (log_query = sql),
              raw: true,
            })
              .then(async (user) => {
                // for log
                createLog(req, constantLogType.USER, user.id, log_query, previousValue);
                profilePicture.userId = user.id;
                if (profilePicture?.profilePicture) {
                  await ProfilePicture.create(profilePicture).catch((err) => {
                    throw err;
                  });
                }
                //notifying the user about new account
                sendMessage(newUserEmailTemplate(user.username, password, firstName, userType));
                res.send({ success: true, message: "Successful!" });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).send({ message: "Error occurred!" });
              });
          } else {
            res.status(403).json({ success: false, message: "Unable to add user maximum number for user exceeded" });
          }
        }
      });
    }
    // normal way of creating user
  }
});

router.put("/user", [auth.required, validator(userEditValidator)], async (req, res, next) => {
  let updatedUser = req.body;
  updatedUser.loginAttemptsCount = updatedUser.loginAttempts;

  // check if user with same email already exists
  const duplicateUser = await User.findOne({
    where: {
      [Op.and]: [{ email: updatedUser.email }, { id: { [Op.ne]: updatedUser.id } }],
    },
  });

  if (duplicateUser) {
    return res.status(409).send({ success: false, message: "Email already exists!" });
  } else {
    if (updatedUser.expiryDate == "Invalid date" || updatedUser.expiryDate == "" || updatedUser.expiryDate == undefined)
      updatedUser.expiryDate = null;

    // if (updatedUser?.departmentId) updatedUser.branchId = null;
    // else if (updatedUser?.branchId) updatedUser.departmentId = null;

    //  remove unwanted object.
    if (!isSuperAdmin(req.payload)) {
      if (updatedUser.roleId == 1) delete updatedUser.roleId;
      if (
        updatedUser.hierarchy == "Super-001" ||
        updatedUser.hierarchy == "CONSTANT" ||
        updatedUser.hierarchy == "Super-000"
      )
        delete updatedUser.hierarchy;

      delete updatedUser.email;
      delete updatedUser.identityNo;
      delete updatedUser.name;
    }

    updateUser(req, updatedUser, (response) => {
      res.json(response);
    });
  }
});

router.put("/user/change-password", validator(passwordValidator), auth.required, async (req, res, next) => {
  let log_query = "";
  const user = await User.findOne({
    where: {
      id: req.payload.id,
    },
  });

  const isAuth = comparePasswordSync(req.body.oldPassword, user.password);
  const isSame = comparePasswordSync(req.body.password, user.password);

  if (!isAuth) {
    return res.send({
      status: "Failed",
      success: false,
      message: "Wrong Password",
    });
  }

  if (isSame) {
    return res.send({
      success: false,
      status: "Failed",
      message: "Your password cannot be same as old password",
    });
  }

  await hashPassword(req.body.password, async (err, newHash) => {
    await User.update(
      { password: newHash, isExpirePassword: false },
      {
        where: { id: user.id },
        logging: (sql) => (log_query = sql),
      }
    );

    await createLog(req, constantLogType.USER, user.id, log_query);

    return res.send({ success: true });
  });
});

router.get("/user", auth.required, async (req, res, next) => {
  const { statusId, roleId, branchId, departmentId, userType } = req.query;
  const searchQuery = {
    statusId: statusId,
    roleId: roleId,
    branchId: branchId,
    departmentId: departmentId,
    isDeleted: 0,
    type: userType,
    distinguishedName: null,
  };
  if (!searchQuery.statusId) delete searchQuery.statusId;
  if (!searchQuery.roleId) delete searchQuery.roleId;
  if (!searchQuery.branchId) delete searchQuery.branchId;
  if (!searchQuery.departmentId) delete searchQuery.departmentId;
  if (!searchQuery.type) delete searchQuery.type;
  if (!searchQuery.distinguishedName) delete searchQuery.distinguishedName;

  let whereString = "";

  Object.entries(searchQuery).map(([key, value], index) => {
    whereString = " AND " + key + " = '" + value + "'" + whereString;
  });

  const hierarchyUser = await availableHierarchy(req.payload.id, "users", "*", whereString);
  res.json(hierarchyUser);
  // User.findAll({
  //   where: searchQuery,
  //   attributes: {
  //     include: [],
  //     exclude: ["password"],
  //   },
  // }).then((users) => res.json(users));
});

router.get("/user/:id", auth.required, (req, res, next) => {
  // To maintain log
  let log_query;

  const { id } = req.params;
  const searchQuery = {
    id: id,
    isDeleted: false,
  };
  User.hasMany(LoginLog);
  User.hasOne(ProfilePicture);
  Promise.all([
    User.findOne({
      // To maintain log
      logging: (sql) => (log_query = sql),
      raw: true,
      where: searchQuery,
      attributes: {
        include: [],
        exclude: ["password"],
      },
      include: [
        {
          model: ProfilePicture,
          required: false,
        },
      ],
    }),
    LoginLog.findAll({
      where: {
        userId: id,
      },
      limit: 15,
      order: [["createdAt", "DESC"]],
    }),
  ])
    .then(([user, loginLogs]) => {
      // To maintain log
      // createLog(req, constantLogType.USER, id, log_query);
      return {
        user,
        loginLogs,
      };
    })
    .then((user) => res.send(user))
    .catch((err) => {
      logger.error(err);
      res.status(500).send();
    });
});

router.get("/user/getByDeptId/:id", auth.required, async (req, res, next) => {
  try {
    const result = await User.findAll({
      where: {
        departmentId: req.params.id,
      },
    });
    res.status(200).json({
      status: "success",
      result,
    });
  } catch (err) {
    console.log("error from controller: ", err);
  }
});

router.delete("/user/:id", auth.required, (req, res, next) => {
  if (req.payload.id == req.params.id) {
    respond(res, "412", "You cannot delete your self.");
    return;
  }
  deleteItem(
    User,
    {
      id: req.params.id,
      type: USER,
    },
    req.payload,
    (response) => {
      res.send(response);
    },
    req
  );
});

router.get("/user-profile", auth.required, (req, res, next) => {
  User.findOne({
    where: { id: req.payload.id },
    attributes: [
      "id",
      "email",
      "username",
      "name",
      "roleId",
      "statusId",
      "branchId",
      "departmentId",
      "isExpirePassword",
      "hierarchy",
      "expiryDate",
      "updatedAt",
      "identityNo",
    ],
  })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      logger.log(err);
      res.status(500).send("Error!");
    });
});

module.exports = router;
