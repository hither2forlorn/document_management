const { body } = require("express-validator");

const locationTypeValidation = [body("name").notEmpty().withMessage("Location type name is required")];
const locationTypeValidationEdit = [body("name").notEmpty().withMessage("Location type name is required")];

module.exports = {
  locationTypeValidation,
  locationTypeValidationEdit,
};
