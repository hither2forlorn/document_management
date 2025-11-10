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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
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
      const filePath = path.join(tempPath, file);
      // Check if the file is a directory
      fs.stat(filePath, (err, stats) => {
        if (err) throw err;
        if (stats.isDirectory() && file !== "zip") {
          // Recursively delete directories other than the 'zip' folder
          rimraf(filePath, (err) => {
            if (err) {
              console.error(`Error deleting directory ${filePath}:`, err);
            }
          });
        } else if (file !== "zip") {
          // Delete files other than the 'zip' folder
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
            }
          });
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
};
