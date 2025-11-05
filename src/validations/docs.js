const { body, check } = require("express-validator");
const { Document } = require("../config/database");
const exists = require("./rules");
const { selectedVendor } = require("../config/selectVendor");

const Docs = [
  check("otherTitle").notEmpty().bail().withMessage("Document Name is required.").trim().escape().custom(exists(Document, "otherTitle")),
  check("securityLevel").custom((value, { req }) => {
    if (value == 3 && req.body?.userAccess && req.body?.userAccess?.length == 0)
      return Promise.reject("Please Select a user ");
    else return true;
  }),
  // selectedVendor === "bok" &&
  // body("name").notEmpty().withMessage("Name is required."),
  body("statusId").notEmpty().withMessage("Status is required."),
  // body("securityLevel").notEmpty().withMessage("Security field is required."),
];

const DocsEdit = [
  body("otherTitle").notEmpty().withMessage("Title field is required.").trim().escape(),
  // selectedVendor === "bok" &&
  // body("name").notEmpty().withMessage("Name is required."),
  body("statusId").notEmpty().withMessage("Status is required."),
  // body("securityLevel").notEmpty().withMessage("Security field is required."),
];

module.exports = {
  Docs,
  DocsEdit,
};
