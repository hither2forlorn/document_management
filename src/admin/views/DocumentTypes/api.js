// import A from "./Util";
import { server } from "admin/config/server";
const url = "/document-type";

function addDocumentType(body, callback) {
  server
    .post(`${url}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getDocumentTypes(callback) {
  server
    .get(`${url}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function editDocumentType(body, callback) {
  server
    .put(`${url}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getDocumentType(id, callback) {
  server
    .get(`${url}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function deleteDocumentType(id, callback) {
  server
    .delete(`${url}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { addDocumentType, getDocumentTypes, editDocumentType, getDocumentType, deleteDocumentType };
