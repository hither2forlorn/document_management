import { server } from "admin/config/server";
const url = "/document-condition";

function addDocumentCondition(body, callback) {
  server
    .post(`${url}`, body)
    .then((response) => callback(null, response.data))
    .catch((err) => callback(err));
}

function editDocumentCondition(body, callback) {
  server
    .put(`${url}`, body)
    .then((response) => callback(null, response.data))
    .catch((err) => callback(err));
}

function getDocumentConditions(callback) {
  server
    .get(`${url}`)
    .then((response) => callback(null, response.data))
    .catch((err) => callback(err));
}

function getDocumentCondition(id, callback) {
  server
    .get(`${url}/${id}`)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
}

function deleteDocumentCondition(id, callback) {
  server
    .delete(`${url}/${id}`)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
}

export { addDocumentCondition, editDocumentCondition, getDocumentCondition, getDocumentConditions, deleteDocumentCondition };
