let PRODUCTION_ENV,
  TESTING_ENV,
  DEVELOPMENT_ENV = false;

// true for production and false for development
if (process.env.NODE_ENV === "production") PRODUCTION_ENV = true;
if (process.env.NODE_ENV === "development") DEVELOPMENT_ENV = true;
if (process.env.NODE_ENV === "testing") TESTING_ENV = true;

module.exports = PRODUCTION_ENV;
module.exports = DEVELOPMENT_ENV;
module.exports = TESTING_ENV;
