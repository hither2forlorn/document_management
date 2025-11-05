import { server } from "admin/config/server";

const URL = "/location-type";

function getLocationTypes(callback) {
  server
    .get(`${URL}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getLocationType(id, callback) {
  server
    .get(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function addLocationType(body, callback) {
  server
    .post(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function editLocationType(body, callback) {
  server
    .put(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function deleteLocationType(id, callback) {
  server
    .delete(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { getLocationType, getLocationTypes, addLocationType, editLocationType, deleteLocationType };
