import axios from "axios";
import { CLIENT_TOKEN } from "config/values";
const getToken = () => ["Client ", localStorage.getItem(CLIENT_TOKEN)].join("");
const header = {
  "Content-Type": "application/json",
  Authorization: getToken(),
};
const headerAuth = {
  Authorization: getToken(),
};

const SERVER_URL = process.env.REACT_APP_SERVER_URL.replace("localhost", window.location.hostname);

const server = axios.create({
  baseURL: SERVER_URL,
  headers: header,
});

export { header, headerAuth, SERVER_URL, server };
