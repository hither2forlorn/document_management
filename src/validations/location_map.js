const { body } = require("express-validator");

const locationMapValidation = [body("name").notEmpty().withMessage("Location map name is required")];

const locationMapValidationEdit = [body("name").notEmpty().withMessage("Location map name is required")];

module.exports = {
  locationMapValidation,
  locationMapValidationEdit,
};
