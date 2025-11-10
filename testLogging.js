const fs = require("fs");
const path = require("path");

const logDir = "logs";
const date = new Date();
const dateString = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
const logFilePath = path.join(logDir, `pm2_logs_${dateString}.log`);
const errorFilePath = path.join(logDir, `pm2_error_${dateString}.log`);

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Write test log entries
fs.appendFileSync(logFilePath, "This is a test log entry.\n", "utf8");
fs.appendFileSync(errorFilePath, "This is a test error entry.\n", "utf8");

console.log("Test log entries written.");
