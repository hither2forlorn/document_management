import axios from "axios";
import { TOKEN } from "config/values";
const getToken = () => ["Admin ", localStorage.getItem(TOKEN)].join("");
const header = {
  "Content-Type": "application/json",
  // Authorization: getToken(),
};
const headerAuth = {
  Authorization: getToken(),
};

const SERVER_URL = process.env.REACT_APP_SERVER_URL.replace("localhost", window.location.hostname);
const server = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true
});

const AxiosPublic = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true
});

export { TOKEN, header, headerAuth, SERVER_URL, server, AxiosPublic };
