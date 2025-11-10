const fs = require("fs");
const path = require("path");

const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getCurrentDateString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
};

const getLogFileName = (type) => {
  return path.join(logDir, `${type}_pm2_${getCurrentDateString()}.log`);
};

module.exports = {
  apps: [
    {
      name: "DMS",
      script: "index.js",
      watch: false,
      instances: "max",
      exec_mode: "cluster",
      out_file: getLogFileName("logs"),
      error_file: getLogFileName("error"),
      env: {
        NODE_ENV: "production",
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      combine_logs: true,
      time: true,
    },
  ],
};
