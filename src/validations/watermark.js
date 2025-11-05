const { body } = require("express-validator");

const watermarkValidation = [
  body("isActive").notEmpty().withMessage("Select an option"),
  body("text").notEmpty().withMessage("watermark text field is required"),
];

module.exports = {
  watermarkValidation,
};
