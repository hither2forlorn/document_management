import { server } from "admin/config/server";

const URL = "/department";

function getDepartments(callback) {
  server
    .get(`${URL}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getDepartment(id, callback) {
  server
    .get(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function addDepartment(body, callback) {
  server
    .post(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function editDepartment(body, callback) {
  server
    .put(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function deleteDepartment(id, callback) {
  server
    .delete(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { getDepartment, getDepartments, addDepartment, editDepartment, deleteDepartment };
