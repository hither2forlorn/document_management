const { body } = require("express-validator");

const documentTypeValidation = [body("name").notEmpty().withMessage("document type name is required")];

const documentTypeValidationEdit = [body("name").notEmpty().withMessage("document type name is required")];

module.exports = {
  documentTypeValidation,
  documentTypeValidationEdit,
};
