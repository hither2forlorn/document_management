// import A from './Util';
import { server } from "admin/config/server";
const URL = "/language";

function addLanguage(body, callback) {
  server
    .post(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getLanguages(callback) {
  server
    .get(`${URL}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function editLanguage(body, callback) {
  server
    .put(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getLanguage(id, callback) {
  server
    .get(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function deleteLanguage(id, callback) {
  server
    .delete(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { addLanguage, getLanguages, editLanguage, getLanguage, deleteLanguage };
