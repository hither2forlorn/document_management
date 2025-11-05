// import moment from 'moment';
// const CryptoJS = require("crypto-js");

// const dateStamp = moment().format("YYYY-MM-DD");

// const getHash = (id) => {
//     return CryptoJS.AES.encrypt(JSON.stringify(id), dateStamp).toString();
// }
// const getId = (hash) => {
//     try {
//         const bytes = CryptoJS.AES.decrypt(hash, dateStamp)
//         return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//     } catch {
//         return null;
//     }
// }

// export default {
//     getHash, getId,
// }
import moment from "moment";
import Hashids from "hashids";
const dateStamp = moment().format("YYYY-MM-DD");

const hashids = new Hashids(dateStamp, 10, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890");
const getHash = (id) => {
  return hashids.encode(id);
};
const getId = (hash) => {
  return hashids.decode(hash)[0];
};

export default {
  getHash,
  getId,
};
