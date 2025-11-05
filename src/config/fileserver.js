import axios from "axios";

const FTP_FILE_SERVER_URL = process.env.REACT_APP_FILE_SERVER_URL;

const fileserver = axios.create({ baseURL: FTP_FILE_SERVER_URL });

module.exports.FTP_FILE_SERVER_URL = FTP_FILE_SERVER_URL;
module.exports.fileserver = fileserver;
