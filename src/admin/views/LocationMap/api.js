import { server } from "admin/config/server";

const URL = "/location-map";

function getLocationMaps(callback) {
  server
    .get(`${URL}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getLocationMap(id, callback) {
  server
    .get(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function addLocationMap(body, callback) {
  server
    .post(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function editLocationMap(body, callback) {
  server
    .put(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function deleteLocationMap(id, callback) {
  server
    .delete(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { getLocationMap, getLocationMaps, addLocationMap, editLocationMap, deleteLocationMap };
