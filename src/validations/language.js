const { body } = require("express-validator");

const languageValidation = [body("name").notEmpty().withMessage("language name is required")];

const languageValidationEdit = [body("name").notEmpty().withMessage("language name is required")];

module.exports = {
  languageValidation,
  languageValidationEdit,
};
