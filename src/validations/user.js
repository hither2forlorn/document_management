const e = require("express");
const { body } = require("express-validator");
const { User } = require("../config/database");
const { banks, getBanksDomain, selectedVendor } = require("../config/selectVendor");
const sameUser = require("../user-management/util/sameUser");
const exists = require("./rules");
const { validSameUserRole, validSameUserHierarchy, validUserDepartmentIdAndBranchId } = require("./rules/user");

const userValidator = [
  body("email")
    .isEmail()
    .custom(exists(User, "Email"))
    .custom((value) => {
      const domain = getBanksDomain();
      const pattern = new RegExp(`^.+${domain.replace(".", "\\.")}$`);

      if (!pattern.test(value)) {
        throw new Error(`Use '${getBanksDomain()}' domain.`);
      }
      return true;
    }),
  body("identityNo").custom(exists(User, "identityNo")),
  // body("phone").optional(),
  // body("gender").notEmpty().withMessage("Gender is required."),
  // body("dateOfBirth").notEmpty().withMessage("Date of Birth is required."),
  // body("expiryDate").notEmpty().withMessage("Expiry Date is required."),
  body("roleId").notEmpty().withMessage("Role is required."),
  // body("branchId").notEmpty().withMessage("Branch is required."),
  // body("departmentId").notEmpty().withMessage("Department is required."),
  body("loginAttempts").notEmpty().withMessage("Login attempts is required."),
  body("statusId").notEmpty().withMessage("Status is required."),
  body("status").optional(),
  body("departmentId").custom(validUserDepartmentIdAndBranchId),
  body("branchId").custom(validUserDepartmentIdAndBranchId),
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be 8 characters."),
];

const passwordValidator = [
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be 8 characters.")

    .matches(`(?=.*[A-Z])`)
    .withMessage(`The string must contain at least 1 uppercase alphabetical character`)
    .matches(`(?=.*[0-9])`)
    .withMessage(`The string must contain at least 1 numeric character`)
    .matches(`(?=.*[!@#$%^&*])`)
    .withMessage(`The string must contain at least one special character like !@#$%^&*`),
];

const userEditValidator = [
  // body("email")
  //   .isEmail()
  //   .custom(exists(User, "Email"))
  //   .custom((value) => {
  //     const domain = getBanksDomain();
  //     const pattern = new RegExp(domain);

  //     if (!pattern.test(value)) {
  //       throw new Error(`Use '${getBanksDomain()}' domain.`);
  //     }
  //     return true;
  //   }),
  // body("phoneNumber").notEmpty().withMessage("Phone is required"),
  // body("gender").notEmpty().withMessage("Gender is required"),
  // body("dateOfBirth").notEmpty().withMessage("DOB is required"),
  body("roleId").custom(validSameUserRole),
  body("hierarchy").custom(validSameUserHierarchy),
  body("statusId").notEmpty().withMessage("Status is required"),
  body("status").optional(),
  body("departmentId").custom(validUserDepartmentIdAndBranchId),
  body("branchId").custom(validUserDepartmentIdAndBranchId),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be 8 characters.")

    .matches(`(?=.*[A-Z])`)
    .withMessage(`The string must contain at least 1 uppercase alphabetical character`)
    .matches(`(?=.*[0-9])`)
    .withMessage(`The string must contain at least 1 numeric character`)
    .matches(`(?=.*[!@#$%^&*])`)
    .withMessage(`The string must contain at least one special character like !@#$%^&*`),
  // body("password").notEmpty().withMessage("Enter Your Password To Continue"),
];

module.exports = {
  userValidator,
  userEditValidator,
  passwordValidator,
};
