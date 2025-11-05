const { validationResult } = require("express-validator");
const ValidationError = require("../errors/validation");

const validator = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    const err = errors.data;

    if (errors.isEmpty()) {
      return next();
    }

    let extractedErrors = {};
    errors.array().map((err) => {
      extractedErrors = { ...extractedErrors, [err.param]: [err.msg] };
      return "";
    });

    throw new ValidationError(extractedErrors);
  };
};

module.exports = validator;
