const httpStatus = require("http-status");
const logger = require("../config/logger");
const { respond } = require("./response");

/**
 * Handles the error when ValidationError is captured.
 *
 * @param err
 * @param res
 */
function ValidationErrorHandler(err, res) {
  const { message, data } = err;
  respond(res, httpStatus.PRECONDITION_FAILED, message, data);
}

/**
 * Handles the error when Invalid Refresh token is received.
 *
 * @param err
 * @param res
 */
function InvalidRefreshTokenHandler(err, res) {
  const { message } = err;
  respond(res, httpStatus.UNAUTHORIZED, message);
}

/**
 * Handles all application errors and send response to client
 */
const ErrorHandler = (err, req, res, next) => {
  const { name } = err;
  console.log(err);
  logger.error(err);

  switch (name) {
    case "Validation Error":
      ValidationErrorHandler(err, res);
      break;
    case "Invalid Refresh Token":
      InvalidRefreshTokenHandler(err, res);
      break;
    case "UnauthorizedError":
      logger.error(err);
      return respond(res, err.status, "Unauthorized");
      break;
    default:
      return respond(res, httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error.");
  }
};

module.exports = ErrorHandler;
