const { body } = require("express-validator");

const departmentValidation = [body("name").notEmpty().withMessage("department name is required")];

const departmentValidationEdit = [body("name").notEmpty().withMessage("department name is required")];

module.exports = {
  departmentValidation,
  departmentValidationEdit,
};
