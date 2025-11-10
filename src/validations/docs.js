const { body, check } = require("express-validator");
const { Document } = require("../config/database");
const exists = require("./rules");
const { selectedVendor } = require("../config/selectVendor");

const Docs = [
  check("otherTitle")
    .notEmpty()
    .bail()
    .withMessage("Document Name is required.")
    .trim()
    .escape()
    .custom(exists(Document, "otherTitle")),
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

const DocsCIF = [
  body("cifName").notEmpty().withMessage("CIF Name is required.").trim().escape(),
  check("securityLevel").custom((value, { req }) => {
    if (value == 3 && req.body?.userAccess && req.body?.userAccess?.length == 0) {
      return Promise.reject("Please Select a user");
    }
    return true;
  }),

  body("statusId").notEmpty().withMessage("Status is required."),

  // Extract and validate cifNumber from the payload
  // Custom validation to ensure either "2" or "8" is required
  body().custom((value, { req }) => {
    const hasCif2 = req.body["2"];
    const hasCif8 = req.body["8"];

    if (!hasCif2 && !hasCif8) {
      throw new Error("Either CIF Number 2 for retail or CIF Number 8 for coorporate is required.");
    }

    return true;
  }),

  // Ensure cifNumber is included in document_index_values
  body("document_index_values").custom((values, { req }) => {
    if (!Array.isArray(values)) {
      throw new Error("document_index_values must be an array.");
    }
    const hasCifIndex = values.some((item) => item.documentIndexId === "2" || item.documentIndexId === "8");
    if (!hasCifIndex) {
      throw new Error("CIF Number must be included in document_index_values.");
    }
    return true;
  }),
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
  DocsCIF,
};
