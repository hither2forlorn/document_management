/**
 * @module FilesystemModule
 */

const multer = require("multer");
const { FTP } = require("./credentials");
const rimraf = require("rimraf");
const fs = require("fs");
const path = require("path");

/**
 * Creating a storage to store file uploaded by the user to later upload to the FTP server
 * This function is of **multer**
 */

// Function to create a directory if it doesn't exist
const createDirectoryIfNotExist = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const watermarkStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "watermark");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const redactionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join("temp", "redactedFiles");
    createDirectoryIfNotExist(destinationPath);
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var EasyFtp = require("easy-ftp");
var ftp = new EasyFtp();
var config = {
  host: FTP.HOST,
  port: FTP.PORT,
  username: FTP.USERNAME,
  password: FTP.PASSWORD,
  type: FTP.TYPE,
};

const FTPClient = require("ftp");

/**
 *
 * @method
 * @param {Function} callback
 * @returns {Boolean} Whether the FTP is connected or not
 */
const checkFtp = (callback) => {
  const ftpClient = new FTPClient();

  const configClient = {
    host: FTP.HOST,
    port: 21,
    user: FTP.USERNAME,
    password: FTP.PASSWORD,
    // connTimeout: 300000,
  };
  ftpClient.connect(configClient);
  ftpClient.on("ready", () => {
    callback(true);
  });
  ftpClient.on("error", () => {
    console.log("Ftp not connected", configClient);
    // throw new Error("FTP not connected - Please check ftp server");
    callback(false);
  });
};

async function checkFTPconnection() {
  const ftpClient = new FTPClient();

  const configClient = {
    host: FTP.HOST,
    port: 21,
    user: FTP.USERNAME,
    password: FTP.PASSWORD,
    // connTimeout: 300000,
  };
  await ftpClient.connect(configClient);
  await ftpClient.on("ready", () => {
    return true;
  });
  await ftpClient.on("error", () => {
    console.log("Ftp not connected", DEVELOPMENT_ENV ? configClient : "");

    throw new Error("FTP not connected - Please check ftp server");
  });
}

/**
 * This function empties the folder path send in the param section
 *
 * @method
 * @param {String} tempPath - Path of the temp directory serving attachments downloaded from the FTP
 */
function emptyTemp(tempPath) {
  tempPath = tempPath ? tempPath : "temp/";
  fs.readdir(tempPath, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(tempPath, file), (err) => {
        if (err) {
          rimraf(path.join(tempPath, file), () => {});
        }
      });
    }
  });
}

module.exports = {
  ftp,
  storage,
  config,
  checkFtp,
  emptyTemp,
  checkFTPconnection,
  watermarkStorage,
  redactionStorage,
};
