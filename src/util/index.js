/**
 * log which can be disable in production
 *
 * @param  {...any} rest
 */
function consoleLog(...rest) {
  if (process.env.NODE_ENV == "development") {
    console.log("================");
    console.log(...rest);
    console.log("================");
  }
}

module.exports = { consoleLog };
