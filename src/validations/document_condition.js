const { body } = require("express-validator");

const documentConditionValidation = [body("name").notEmpty().withMessage("document condition name is required")];

const documentConditionValidationEdit = [body("name").notEmpty().withMessage("document condition name is required")];

module.exports = {
  documentConditionValidation,
  documentConditionValidationEdit,
};
